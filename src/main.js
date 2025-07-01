import './style.css';
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { ApolloClient, InMemoryCache, ApolloLink } from '@apollo/client/core';
import { createApolloProvider } from '@vue/apollo-option';
import { DefaultApolloClient } from '@vue/apollo-composable';
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs';
import App from './App.vue'
import router from './router/route'

const httpLink = createUploadLink({
  uri: `${import.meta.env.VITE_API_URL}/graphql`,
});


const authLink = new ApolloLink((operation, forward) => {
  const operationName = operation.operationName;

  if (operationName === 'SignUp' || operationName === 'login') {
    return forward(operation);
  }

  const token = localStorage.getItem('token');
  if (token) {
    operation.setContext({
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return forward(operation);
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;
const apolloProvider = createApolloProvider({
  defaultClient: client,
});

const app = createApp(App);


app.use(createPinia());
app.use(router);
app.use(apolloProvider);


app.provide(DefaultApolloClient, client);

app.mount('#app');
