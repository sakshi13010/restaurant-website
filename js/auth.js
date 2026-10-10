import { auth, db } from './firebase-config.js';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendEmailVerification,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Sign Up Logic
document.getElementById('signupForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const fullName = document.getElementById('fullName').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const phone = document.getElementById('phone').value;
  const errorDiv = document.getElementById('signupError');

  // Validation
  if (password !== confirmPassword) {
    errorDiv.textContent = 'Passwords do not match';
    errorDiv.style.display = 'block';
    return;
  }

  if (password.length < 6) {
    errorDiv.textContent = 'Password must be at least 6 characters';
    errorDiv.style.display = 'block';
    return;
  }

  try {
    // Create user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update profile
    await updateProfile(user, { displayName: fullName });

    // Send verification email
    await sendEmailVerification(user);

    // Save user data to Firestore
    await setDoc(doc(db, 'users', user.uid), {
      fullName,
      email,
      phone,
      createdAt: new Date().toISOString(),
      role: 'customer'
    });

    // Redirect to dashboard
    window.location.href = '../admin/dashboard.html';
    
  } catch (error) {
    errorDiv.textContent = error.message;
    errorDiv.style.display = 'block';
  }
});

// Login Logic
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('loginError');

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Check email verification
    if (!user.emailVerified) {
      errorDiv.textContent = 'Please verify your email before logging in';
      errorDiv.style.display = 'block';
      return;
    }

    // Get user data
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data();

    if (userData) {
      // Redirect based on role
      if (userData.role === 'admin') {
        window.location.href = '../admin/dashboard.html';
      } else {
        window.location.href = '../index.html';
      }
    }
    
  } catch (error) {
    errorDiv.textContent = 'Invalid email or password';
    errorDiv.style.display = 'block';
  }
});

// Check auth state
auth.onAuthStateChanged((user) => {
  if (user) {
    // User is signed in
    console.log('User signed in:', user.email);
  } else {
    // User is signed out
    console.log('User signed out');
  }
});