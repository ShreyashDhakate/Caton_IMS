use mysql::{Pool, PooledConn, Opts, OptsBuilder};
use dotenv::dotenv;
use std::env;

pub fn get_db_connection() -> Result<PooledConn, String> {
    // Load the environment variables from the .env file
    dotenv().ok();

    // Get the DATABASE_URL from the environment variables
    let database_url = env::var("DATABASE_URL").map_err(|e| e.to_string())?;

    // Create an OptsBuilder from the database URL
    let opts = Opts::from_url(&database_url).map_err(|e| e.to_string())?;
    
    // Create a new connection pool using the Opts object
    let pool = Pool::new(opts).map_err(|e| e.to_string())?;

    // Get a connection from the pool
    pool.get_conn().map_err(|e| e.to_string())
}
