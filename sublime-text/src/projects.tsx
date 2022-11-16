import { Action, ActionPanel, List } from '@raycast/api';
import { listSublimeProjects } from './utils';


export default (): JSX.Element => {
  const projects = listSublimeProjects();
  return (
    <List>
      {projects.map((project, index) => (
        <List.Item
          key={index}
          icon='sublime-text.png'
          accessories={[{ text: project.fileName }, { icon: 'select-icon.png' }]}
          title={project.name}
          actions={
            <ActionPanel>
              <Action.Open title='Open Project' target={project.relativePath} />
              <Action.ShowInFinder title='Reveal in Finder' path={project.relativePath} />
              <Action.Trash title='Move to Trash' paths={[project.relativePath, project.workspace]} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
