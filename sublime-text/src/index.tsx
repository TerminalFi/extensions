import { Action, ActionPanel, getPreferenceValues, List } from "@raycast/api";

//requiring path and fs modules
import path = require("path");
import fs = require("fs");
// import proc = require("child_process");

interface Preferences {
  project_location: string;
}

export default function Command() {
  const preferences = getPreferenceValues<Preferences>();

  const dirPath = path.resolve(preferences.project_location);
  const jsonsInDir = fs.readdirSync(dirPath).filter((file) => path.extname(file) === ".sublime-project");
  const projects = jsonsInDir.map((project) => {
    return { name: path.parse(project).name, path: path.join(dirPath, project) };
  });
  return (
    <List>
      {projects.map((project, index) => (
        <List.Item
          key={project.name}
          icon="Sublime Text.png"
          title={project.name}
          actions={
            <ActionPanel>
              <Action.Open title="Open Project" target={project.path} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
