import './style.css';
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { ApolloClient, InMemoryCache } from '@apollo/client/core';
import { createApolloProvider } from '@vue/apollo-option';
// Add this import
import { DefaultApolloClient } from '@vue/apollo-composable';
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs';
import App from './App.vue'
import router from './router'

// Apollo Client setup
const httpLink = createUploadLink({
  uri: 'http://localhost:3000/graphql',
  headers: {
    get Authorization() {
      return `Bearer ${localStorage.getItem('token') || ''}`;
    },
  },
});

const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

const apolloProvider = createApolloProvider({
  defaultClient: apolloClient,
});

const app = createApp(App);

// Modify this section to provide the Apollo client for the Composition API
app.use(createPinia());
app.use(router);
app.use(apolloProvider);

// Add this line to provide the Apollo client for the Composition API
app.provide(DefaultApolloClient, apolloClient);

app.mount('#app');
