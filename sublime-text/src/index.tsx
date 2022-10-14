import { Action, ActionPanel, getPreferenceValues, List } from "@raycast/api";
import { homedir } from "os";

import path = require("path");
import fs = require("fs");

interface Preferences {
  project_location: string;
}

export default function Command() {
  const preferences = getPreferenceValues<Preferences>();
  const dirPath = preferences.project_location.startsWith("~") ? path.join(homedir(), preferences.project_location.slice(1)) : preferences.project_location

  const projects = fs.readdirSync(dirPath).filter((file) => path.extname(file) === ".sublime-project").map((project) => {
    return { name: path.parse(project).name, path: path.join(dirPath, project) };
  });
  return (
    <List>
      {projects.map((project, index) => (
        <List.Item
          key={index}
          icon="Sublime Text.png"
          title={project.name}
          actions={
            <ActionPanel>
              <Action.Open title="Open Project" target={project.path} />
              <Action.ShowInFinder title="Reveal in Finder" path={project.path} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
