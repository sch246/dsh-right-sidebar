# File-drop ownership correction

The user moved native file-drop routing and overlays into the independent dsh-file-drop plugin. The right sidebar owns layout geometry and internal tab docking only; its advertised `registerFileDropHandler` API and sidebar file-receiver requirement were removed before the pre-release 0.0.3 revision. Consumers may mount the external file-drop surface over sidebar panels without a sidebar dependency.
