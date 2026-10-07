import { loadPluginManifests } from './pluginRuntime'

export function bootstrapExtensions() {
  const manifests = loadPluginManifests()

  return {
    loaded: manifests.length,
    ids: manifests.map((manifest) => manifest.id),
  }
}
