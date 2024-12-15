<template>
 
    <v-container class="mt-5">
        <v-text-field
            label="Email"
            v-model="email"
        ></v-text-field>

        <v-text-field
            label="Username"
            v-model="username"
        ></v-text-field>

        <v-text-field
            v-model="password"
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            :type="showPassword ? 'text' : 'password'"
            label="Password"
            name="password"
            counter
            @click:append="showPassword = !showPassword"
        ></v-text-field>

        <v-btn color="primary" block @click="register" rounded="0">Create Account</v-btn>

        <div class="mt-2 text-center">
            <a href="/login">Login</a>
        </div>
    </v-container>
 
</template>


<script>
import { auth } from '@/firebase.js';
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { createToast } from 'mosha-vue-toastify'
import 'mosha-vue-toastify/dist/style.css'

export default {
    
    data: () => ({
        email: '',
        username: '',
        password: ''
    }),

    methods: {
        async register() {
         
            try {
                const userCredential = await createUserWithEmailAndPassword(
                    auth,
                    this.email,
                    this.password
                );
                const user = userCredential.user;

                await updateProfile(user, { displayName: this.username });
               
                createToast(
                    {
                        title: 'Created user!',
                        description: "You'll now be redirected to the login page."
                    }, 
                    { type: 'success', position: 'bottom-right' }
                );

                this.$router.push('/login');
                
            } catch (error) {
               
                createToast(
                    {
                        title: 'Cannot create user',
                        description: 'Please check your details.'
                    }, 
                    { type: 'danger', position: 'bottom-right' }
                );

            }

        }
    }
}
</script>