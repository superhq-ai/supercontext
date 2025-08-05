# api

To install dependencies:

```bash
bun install
```

To run:

```bash
bun dev
```

### Create Admin User

To create a new admin user, run the following command:

```bash
bun run admin:create <email>
```

If you don't provide an email, the script will prompt you to enter one. The script will output an invite URL that you can use to sign up.