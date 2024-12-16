/**
 * 1. after successful login : generate a jwt token
 * npm i jsonwebtoken , cookie-parser
 * jwt.sign(payload , secret , {expiresIn: '1d'})
 * 
 * 2. send token (generate in the server  side) to the client side local storage ===> easier
 * 
 * 
 * httpOnly cookie ---> better
 * 
 * 3. for sensitive or secure or private or production apis: and token to the server
 * 
 * 
 * on the server side
 * app.use(cors({
   origin: ['http://localhost:5173'],
   credentials: true,
 }));
 * 
 * 
 * on the client site
 * use the get , post delete , patch for secure apis and must use: {withCredentials: true}
 * 
 * 
 * 4. validate the token in the server side
 * if valid: provide data
 * id not valid: login
 * 
 * 
 * 
 * 
 */