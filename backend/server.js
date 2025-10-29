import app from './app.js'
import { dbConnection } from './config/db.js'



import dotenv from 'dotenv'

dotenv.config({path:'backend/config/config.env'})

dbConnection();


const port = process.env.PORT || 3000 ;



process.on('uncaughtException',(err)=>{
     console.log(`Error : ${err.message}`);
      console.log(`Server is shutting down due to uncought exception error`);
      process.exit(1);
})




const server = app.listen( port,()=>{
     console.log(`server is running on port : ${port}`)
})

process.on('unhandledRejection',(err)=>{
     console.log(`Error : ${err.message}`);
     console.log(`Server is shutting down due to unhandled promise rejection`);
     server.close(()=>{
          process.exit(1)
     })
})