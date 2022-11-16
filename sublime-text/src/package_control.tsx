import { List, ActionPanel, Action } from '@raycast/api';
import { NodeHtmlMarkdown } from 'node-html-markdown'
import { returnPackages, returnPackageInfo, generateAccessories, Results, Package } from './utils';
import { useState } from "react";
import { getPreferences } from './preferences';

export default function PackageList() {
  const [results, setResults] = useState<Results | null>();
  const [packageInfo, setPackageInfo] = useState<Package | null>();
  const [loading, setLoading] = useState<boolean>(false);

  const prefs = getPreferences();

  const onSelectionChange = async (id: string | null) => {
    setLoading(true);
    if (id === null) {
      setLoading(false);
      return
    }
    if (results === null) {
      return
    }
    const pkgID = parseInt(id)
    if (pkgID === undefined) {
      setLoading(false);
      return
    }
    const pkg = results?.packages[pkgID]
    if (pkg === undefined) {
      setLoading(false);
      return
    }
    await returnPackageInfo(pkg.name).then((response) => {
      console.log(response)
      setPackageInfo(response)
      setLoading(false);
    });
  };
  const onSearchTextChange = async (text: string) => {
    setLoading(true);
    await returnPackages(encodeURI(text)).then((response) => {
      setResults(response)
      setLoading(false);
    });
  };

  return (
    <List isShowingDetail={results?.packages.length != 0 && results?.packages.length != null} isLoading={loading} searchBarPlaceholder={`Search package control`} onSearchTextChange={onSearchTextChange} onSelectionChange={onSelectionChange} throttle>
      {results?.packages.length
        ? results.packages.map((result, index) => {
          return <List.Item
            id={`${index}`}
            key={index}
            title={result.name}
            accessories={generateAccessories(result)}
            actions={
              <ActionPanel title={`${result.name} Actions`}>
                <Action.OpenInBrowser title='Open on Package Control' url={`https://packagecontrol.io/packages/${encodeURI(result.name)}`} />
                {
                  packageInfo?.homepage != null ? <Action.OpenInBrowser title='Open Homepage' url={packageInfo?.homepage} icon="home_dark.png" /> : null
                }
                {
                  packageInfo?.issues != null ? <Action.OpenInBrowser title='Open Issues' url={packageInfo?.issues} icon="issues_dark.png" /> : null
                }
                {
                  packageInfo?.donate != null ? <Action.OpenInBrowser title='Donate to Author' url={packageInfo?.donate} icon="donate_dark.png" /> : null
                }
              </ActionPanel>
            }
            detail={
              <List.Item.Detail
                markdown={prefs.load_remote_html ? NodeHtmlMarkdown.translate(packageInfo?.readme_html != null ? packageInfo?.readme_html : result.highlighted_description) : result.highlighted_description}
                metadata={
                  <List.Item.Detail.Metadata>
                    {
                      result.highlighted_authors.length !== 0 ? <List.Item.Detail.Metadata.Label title="Authors" text={result.highlighted_authors.join(", ")} /> : null
                    }
                    {result.labels.length !== 0 ? (
                      <List.Item.Detail.Metadata.TagList title="Labels">
                        {result.labels.map((label) => (
                          <List.Item.Detail.Metadata.TagList.Item text={label} key={label} />
                        ))}
                      </List.Item.Detail.Metadata.TagList>
                    ) : null}
                    {result.platforms.length !== 0 ? (
                      <List.Item.Detail.Metadata.TagList title="Platforms">
                        {result.platforms.map((platform) => (
                          <List.Item.Detail.Metadata.TagList.Item text={platform} key={platform} />
                        ))}
                      </List.Item.Detail.Metadata.TagList>
                    ) : null}
                    {result.st_versions.length !== 0 ? (
                      <List.Item.Detail.Metadata.TagList title="Versions (Supported)">
                        {result.st_versions.map((version) => (
                          <List.Item.Detail.Metadata.TagList.Item text={`${version}`} key={`${version}`} />
                        ))}
                      </List.Item.Detail.Metadata.TagList>
                    ) : null}
                    <List.Item.Detail.Metadata.Label title="Unique Installs" text={`${(result.unique_installs).toLocaleString(undefined, { minimumFractionDigits: 0 })}`} />
                    <List.Item.Detail.Metadata.Label title="First Seen" text={new Date(result.first_seen).toLocaleString()} />
                    <List.Item.Detail.Metadata.Label title="Last Updated" text={new Date(result.last_modified).toLocaleString()} />
                  </List.Item.Detail.Metadata>
                } />
            } />;
        })
        : null}
    </List>
  );
}