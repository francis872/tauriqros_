#[path = "../services/mod.rs"]
mod services;
#[path = "../system/mod.rs"]
mod system;
#[path = "../runtime/mod.rs"]
mod runtime;
#[path = "../integrations/mod.rs"]
mod integrations;
#[path = "../session/mod.rs"]
mod session;
#[path = "../control/mod.rs"]
mod control;
#[path = "../linux/mod.rs"]
mod linux;
#[path = "../dbus/mod.rs"]
mod dbus;
#[path = "../automation/mod.rs"]
mod automation;
#[path = "../lifecycle/mod.rs"]
mod lifecycle;
#[path = "../daemons/mod.rs"]
mod daemons;
#[path = "../devices/mod.rs"]
mod devices;
#[path = "../telemetry/mod.rs"]
mod telemetry;
#[path = "../ai/mod.rs"]
mod ai;
#[path = "../security/mod.rs"]
mod security;
#[path = "../identity/mod.rs"]
mod identity;
#[path = "../orchestration/mod.rs"]
mod orchestration;
#[path = "../agents/mod.rs"]
mod agents;
#[path = "../ecosystem/mod.rs"]
mod ecosystem;
#[path = "../sandbox/mod.rs"]
mod sandbox;
#[path = "../memory/mod.rs"]
mod memory;
#[path = "../filesystem/mod.rs"]
mod filesystem;
#[path = "../search/mod.rs"]
mod search;
#[path = "../workspace/mod.rs"]
mod workspace;
#[path = "../planning/mod.rs"]
mod planning;
#[path = "../collaboration/mod.rs"]
mod collaboration;
#[path = "../performance/mod.rs"]
mod performance;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      let _runtime_track = runtime::session::RUNTIME_TRACK;
      let _orchestration_track = runtime::orchestrator::ORCHESTRATION_TRACK;
      let _session_mode = system::linux::SESSION_MODE;
      let _display_protocol = system::linux::TARGET_DISPLAY_PROTOCOL;
      let _session_runtime_manager = session::SESSION_RUNTIME_MANAGER;
      let _control_surface = control::CONTROL_SURFACE;
      let _wayland_session_target = linux::WAYLAND_SESSION_TARGET;
      let _dbus_runtime_state = dbus::DBUS_RUNTIME_STATE;
      let _automation_runtime_state = automation::AUTOMATION_RUNTIME_STATE;
      let _lifecycle_runtime_state = lifecycle::LIFECYCLE_RUNTIME_STATE;
      let _daemon_runtime_state = daemons::DAEMON_RUNTIME_STATE;
      let _device_runtime_state = devices::DEVICE_RUNTIME_STATE;
      let _telemetry_engine_state = telemetry::TELEMETRY_ENGINE_STATE;
      let _ai_runtime_state = ai::AI_RUNTIME_STATE;
      let _security_runtime_state = security::SECURITY_RUNTIME_STATE;
      let _identity_runtime_state = identity::IDENTITY_RUNTIME_STATE;
      let _orchestration_runtime_state = orchestration::ORCHESTRATION_RUNTIME_STATE;
      let _agents_runtime_state = agents::AGENT_RUNTIME_STATE;
      let _distributed_runtime_state = ecosystem::DISTRIBUTED_RUNTIME_STATE;
      let _sandbox_runtime_state = sandbox::SANDBOX_RUNTIME_STATE;
      let _memory_runtime_state = memory::MEMORY_RUNTIME_STATE;
      let _cognitive_filesystem_state = filesystem::COGNITIVE_FILESYSTEM_STATE;
      let _dbus_state = integrations::dbus::DBUS_BRIDGE_STATE;
      let _pipewire_state = integrations::pipewire::PIPEWIRE_STATE;
      let _wayland_state = integrations::wayland::WAYLAND_INTEGRATION_STATE;
      let _background_service_state = services::background::BACKGROUND_SERVICE_STATE;

      let _runtime_capabilities = runtime::orchestrator::runtime_capabilities();
      let _startup_flow = session::manager::startup_flow();
      let _control_actions = control::power::supported_actions();
      let _startup_scripts = linux::session_entry::startup_scripts();
      let _dbus_services = dbus::bridge::service_targets();
      let _automation_workflows = automation::engine::supported_workflows();
      let _lifecycle_stages = lifecycle::manager::lifecycle_stages();
      let _daemon_registry = daemons::supervisor::daemon_registry();
      let _runtime_supervisor_capabilities = runtime::supervisor::supervisor_capabilities();
      let _runtime_scheduler_tracks = runtime::scheduler::cognitive::scheduler_tracks();
      let _runtime_recovery = runtime::recovery::recovery_policies();
      let _runtime_watchdog = runtime::watchdog::watchdog_signals();
      let _device_domains = devices::telemetry::telemetry_domains();
      let _telemetry_streams = telemetry::engine::telemetry_streams();
      let _ai_backends = ai::bridge::model_backends();
      let _ai_streaming = ai::runtime::streaming::streaming_capabilities();
      let _ai_inference_targets = ai::runtime::inference::inference_targets();
      let _ai_scheduler_features = ai::runtime::scheduler::scheduler_features();
      let _ai_context_channels = ai::runtime::context::context_channels();
      let _ai_model_registry = ai::models::registry::model_registry();
      let _ollama_features = ai::ollama::ollama_features();
      let _ollama_endpoint = ai::ollama::client::endpoint();
      let _ollama_streaming = ai::ollama::streaming::streaming_protocols();
      let _ollama_embeddings = ai::ollama::embeddings::embedding_dimensions();
      let _ollama_models = ai::ollama::models::runtime_models();
      let _agent_catalog = agents::runtime::agent_catalog();
      let _distributed_features = ecosystem::distributed::distributed_features();
      let _sandbox_targets = sandbox::sandbox_manager::sandbox_targets();
      let _sandbox_policies = sandbox::capability_runtime::capability_policies();
      let _semantic_store = memory::semantic_store::semantic_store_capabilities();
      let _continuity_features = memory::continuity::continuity_features();
      let _recall_modes = memory::recall::recall_modes();
      let _cognitive_agent_features = agents::cognitive::cognitive_agent_capabilities();
      let _cognitive_filesystem_features = filesystem::cognitive::cognitive_filesystem_features();
      let _cognitive_search_features = search::cognitive_search_capabilities();
      let _predictive_workspace_features = workspace::predictive_workspace_features();
      let _autonomous_planning = planning::autonomous_planning_features();
      let _collaboration_features = collaboration::collaboration_runtime_features();
      let _acceleration_features = performance::acceleration_features();
      let _vector_features = memory::vector::vector_memory_features();
      let _persistent_agents = agents::persistent::persistent_agent_features();
      let _runtime_cognitive = runtime::cognitive::cognitive_kernel_features();
      let _gpu_runtime = performance::gpu::gpu_runtime_features();
      let _rag_runtime = search::rag::rag_runtime_features();
      let _identity_channels = identity::manager::identity_channels();
      let _security_capabilities = security::tokens::security_capabilities();
      let _runtime_graph = orchestration::graph::runtime_graph_nodes();
      let _mesh_endpoints = services::mesh::rpc::mesh_endpoints();
      let _planned_protocols = integrations::wayland::planned_protocols();
      let _background_services = services::background::registered_background_services();

      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      services::desktop_runtime_health,
      services::filesystem::filesystem_read_directory,
      services::filesystem::filesystem_list_mounts,
      services::system_control::system_control_execute,
      services::automation_runtime::automation_run_workflow,
      services::session_runtime::session_runtime_bootstrap,
      services::session_runtime::session_runtime_daemon_status,
      services::runtime_supervisor::runtime_supervisor_state,
      services::device_runtime::device_runtime_snapshot,
      services::ai_runtime::ai_runtime_infer,
      services::ai_runtime::ai_stream_infer,
      services::ai_runtime::ai_model_list,
      services::ai_runtime::ai_model_load,
      services::ai_runtime::ai_model_unload,
      services::ai_runtime::ai_runtime_health,
      services::ollama_runtime::ai_runtime_stream,
      services::embedding_runtime::ai_runtime_embeddings,
      services::ollama_runtime::ai_runtime_models,
      services::ollama_runtime::ai_runtime_cancel,
      services::ollama_runtime::ai_runtime_queue_state,
      services::rag_runtime::rag_runtime_query,
      services::security_runtime::security_issue_session_token,
      services::identity_runtime::identity_recover_session,
      services::telemetry_runtime::telemetry_trace_summary,
      services::orchestration_runtime::orchestration_dependency_graph,
      services::filesystem_intelligence::filesystem_semantic_summary,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
