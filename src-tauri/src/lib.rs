use tauri_plugin_sql::{Migration, MigrationKind};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations(
                    "sqlite:habit-tracker.db",
                    vec![Migration {
                        version: 1,
                        description: "local_state",
                        sql: include_str!("../migrations/001_local_state.sql"),
                        kind: MigrationKind::Up,
                    }],
                )
                .build(),
        )
        .run(tauri::generate_context!())
        .expect("Unable to start Habit Tracker");
}
