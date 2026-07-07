import supabase from './supabase.js';

let currentUser = null;

/**
 * Inicializa el sistema de autenticación.
 */
export async function initAuth(onLogin) {
    const authView = document.getElementById('auth-view');
    const dashboardView = document.getElementById('dashboard-view');
    const authForm = document.getElementById('auth-form');
    const userMenu = document.getElementById('user-menu');
    const userName = document.getElementById('user-name');
    const displayName = document.getElementById('display-name');
    const btnLogout = document.getElementById('btn-logout');
    const errorMsg = document.getElementById('auth-error');
    const successMsg = document.getElementById('auth-msg');
    const btnToggleAuth = document.getElementById('btn-toggle-auth');
    const authTitle = document.getElementById('auth-title');
    const authSubtitle = document.getElementById('auth-subtitle');
    const btnAuthSubmit = document.getElementById('btn-auth-submit');
    const usernameContainer = document.getElementById('username-container');

    let isSignupMode = false;

    // Toggle entre Login y Registro
    btnToggleAuth.addEventListener('click', () => {
        isSignupMode = !isSignupMode;
        errorMsg.classList.add('hidden');
        successMsg.classList.add('hidden');
        
        if (isSignupMode) {
            authTitle.textContent = 'Registrarse';
            authSubtitle.textContent = 'Crea tu cuenta y únete a la liga.';
            btnAuthSubmit.textContent = 'Crear Cuenta';
            btnToggleAuth.textContent = '¿Ya tienes cuenta? Inicia sesión aquí';
            usernameContainer.classList.remove('hidden');
            document.getElementById('username').required = true;
        } else {
            authTitle.textContent = 'Iniciar Sesión';
            authSubtitle.textContent = 'Ingresa para participar en las quinielas.';
            btnAuthSubmit.textContent = 'Entrar';
            btnToggleAuth.textContent = '¿No tienes cuenta? Regístrate aquí';
            usernameContainer.classList.add('hidden');
            document.getElementById('username').required = false;
        }
    });

    // Verificar sesión existente
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        await handleLogin(session.user, onLogin);
    } else {
        authView.classList.remove('hidden');
    }

    // Listener de cambios de estado de autenticación
    supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session) {
            await handleLogin(session.user, onLogin);
        } else {
            handleLogout();
        }
    });

    // Formulario de login/registro
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMsg.classList.add('hidden');
        successMsg.classList.add('hidden');
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const usernameInput = document.getElementById('username').value;
        
        if (isSignupMode) {
            // REGISTRO
            const { data: regData, error: regError } = await supabase.auth.signUp({ 
                email, 
                password,
                options: { data: { nombre: usernameInput } }
            });
            
            if (regError) {
                errorMsg.textContent = regError.message;
                errorMsg.classList.remove('hidden');
            } else if (regData.user) {
                if (!regData.session) {
                    successMsg.textContent = 'Cuenta creada. Revisa tu correo para confirmar.';
                    successMsg.classList.remove('hidden');
                }
            }
        } else {
            // LOGIN
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                errorMsg.textContent = error.message;
                errorMsg.classList.remove('hidden');
            }
        }
    });

    // Logout
    btnLogout.addEventListener('click', async () => {
        await supabase.auth.signOut();
    });

    /**
     * Maneja el flujo post-login: muestra el dashboard y obtiene/crea el perfil.
     */
    async function handleLogin(user, callback) {
        currentUser = user;
        authView.classList.add('hidden');
        dashboardView.classList.remove('hidden');
        userMenu.classList.remove('hidden');
        
        // Intentar obtener el perfil existente
        let { data: perfil } = await supabase.from('perfiles').select('nombre').eq('id', user.id).single();
        
        // Si no existe perfil, lo creamos (primera vez que inicia sesión)
        if (!perfil) {
            const nombre = user.user_metadata?.nombre || user.email.split('@')[0];
            await supabase.from('perfiles').upsert({ id: user.id, nombre: nombre, email: user.email });
            perfil = { nombre: nombre };
        }
        
        const name = perfil.nombre;
        userName.textContent = name;
        displayName.textContent = name;
        
        if (callback) callback(user.id);
    }

    /**
     * Maneja el flujo de logout: limpia la UI y muestra el formulario de auth.
     */
    function handleLogout() {
        currentUser = null;
        authView.classList.remove('hidden');
        dashboardView.classList.add('hidden');
        userMenu.classList.add('hidden');
    }
}

export function getCurrentUser() {
    return currentUser;
}
