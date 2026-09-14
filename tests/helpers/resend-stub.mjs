// Stands in for the `resend` package so api/subscribe.js can be driven end to
// end without a network or a key. Records every call so a test can assert what
// was NOT done — no second welcome on a duplicate, nothing sent when the gate
// is closed — which is the half that silently rots.

export const calls = { contacts: [], emails: [] };

let contactMode = 'ok'; // ok | duplicate | reject
let emailMode = 'ok'; // ok | reject | throw

export function setMode(contact, email) {
  contactMode = contact;
  emailMode = email;
}

export function reset() {
  calls.contacts.length = 0;
  calls.emails.length = 0;
}

export class Resend {
  constructor(key) {
    this.key = key;
  }

  contacts = {
    create: async (payload) => {
      calls.contacts.push(payload);
      if (contactMode === 'duplicate') {
        return { error: { name: 'validation_error', message: 'Contact already exists' } };
      }
      if (contactMode === 'reject') {
        return { error: { name: 'restricted_api_key', message: 'no access' } };
      }
      return { data: { id: 'contact_test' } };
    },
  };

  emails = {
    send: async (payload) => {
      calls.emails.push(payload);
      if (emailMode === 'throw') throw new Error('socket hang up');
      if (emailMode === 'reject') {
        return { error: { name: 'validation_error', message: 'domain is not verified' } };
      }
      return { data: { id: 'email_test' } };
    },
  };
}
