use tokio::sync::Mutex;
use std::sync::Arc;

#[derive(Default)]
pub struct SessionState {
    pub user_id: Arc<Mutex<Option<String>>>,
}
