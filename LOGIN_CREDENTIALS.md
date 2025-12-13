# PharmaSuite Cloud - Login Credentials

## Admin User Account

An admin user has been created for you to get started:

```
📧 Email:    admin@pharmacy.com
🔑 Password: admin123
```

## Getting Started

1. **Stop the current dev server** (if running) by pressing `Ctrl+C` in the terminal

2. **Delete the `.next` folder** to clear the build cache:
   ```bash
   Remove-Item -Recurse -Force .next
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and navigate to:
   ```
   http://localhost:3000
   ```

5. **Login** with the credentials above

6. **⚠️ IMPORTANT**: Change your password after first login!

## Creating Additional Users

You can create more users through the admin panel once logged in, or by using the registration API endpoint.

## Troubleshooting

If you encounter any MongoDB connection errors:
- Make sure the `.env` file exists with your MongoDB connection string
- Verify your MongoDB Atlas cluster is accessible
- Check that your IP address is whitelisted in MongoDB Atlas

## Need Help?

Check the README.md file for more detailed documentation and setup instructions.