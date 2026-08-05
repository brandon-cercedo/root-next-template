import {  } from '../types/generated/client';
import { faker } from '@faker-js/faker';
import Decimal from 'decimal.js';



export function fakeUser() {
  return {
    name: null,
    email: faker.internet.email(),
    emailVerified: null,
    image: null,
    password: null,
    updatedAt: faker.date.anytime(),
  };
}
export function fakeUserComplete() {
  return {
    id: faker.string.uuid(),
    name: null,
    email: faker.internet.email(),
    emailVerified: null,
    image: null,
    password: null,
    createdAt: new Date(),
    updatedAt: faker.date.anytime(),
  };
}
export function fakeAccount() {
  return {
    type: faker.lorem.words(5),
    provider: faker.lorem.words(5),
    providerAccountId: faker.lorem.words(5),
    refresh_token: null,
    access_token: null,
    expires_at: null,
    token_type: null,
    scope: null,
    id_token: null,
    session_state: null,
    updatedAt: faker.date.anytime(),
  };
}
export function fakeAccountComplete() {
  return {
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    type: faker.lorem.words(5),
    provider: faker.lorem.words(5),
    providerAccountId: faker.lorem.words(5),
    refresh_token: null,
    access_token: null,
    expires_at: null,
    token_type: null,
    scope: null,
    id_token: null,
    session_state: null,
    createdAt: new Date(),
    updatedAt: faker.date.anytime(),
  };
}
