import { List } from '@raycast/api';
import { useEffect, useState } from "react";
import { returnChangeLog, returnSublimeUpdates, SublimeUpdates } from "./utils";


export default function UpdateList() {
  const [updates, setUpdates] = useState<SublimeUpdates | null>();
  const [changelog, setChangelog] = useState<string | null>();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function fetch() {
      setLoading(true)
      const updates = await returnSublimeUpdates();
      setUpdates(updates);
      setLoading(false);
    }
    fetch();
  }, []);

  const onSelectionChange = async (id: string | null) => {
    setLoading(true);
    if (id === null) {
      setLoading(false);
      return
    }
    await returnChangeLog(id).then((response) => {
      setChangelog(response)
      setLoading(false);
    })
  };
  return (
    <List isShowingDetail={changelog !== null} isLoading={loading} onSelectionChange={onSelectionChange} throttle>
      {updates?.updates.length
        ? updates.updates.map((update, index) => {
          return <List.Item
            id={`${update.update_url}`}
            key={index}
            icon='sublime-text.png'
            title={update.update_url.endsWith('download') ? 'Sublime Text - Stable' : 'Sublime Text - Development'}
            accessories={[{ text: `${update.latest_version}` }]}
            detail={
              <List.Item.Detail
                markdown={changelog}
              />
            } 
          />;
        })
        : null}
    </List>
  );
}