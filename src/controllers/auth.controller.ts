export class AuthController {
    signup(req: any, res: any) {
      res.send('Signup successful!');
    }
  
    login(req: any, res: any) {
      res.send('Login successful!');
    }
  
    logout(req: any, res: any) {
      res.send('Logout successful!');
    }
  }
  