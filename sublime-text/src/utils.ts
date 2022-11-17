import { showToast, Toast } from '@raycast/api';
import { sync as find } from 'fast-glob';
import fetch from 'node-fetch';
import { NodeHtmlMarkdown } from 'node-html-markdown';
import { parse } from 'node-html-parser';
import { homedir } from 'os';
import { parse as parsePath } from 'path';
import { getPreferences } from './preferences';
import path = require('path');



export interface SublimeTextProject {
  name: string;
  relativePath: string;
  fileName: string;
  workspace: string;
}

export const listSublimeProjects = (): Array<SublimeTextProject> => {
  const paths = getPreferences().locations.split(';').map((item) => item.startsWith('~') ? `${path.join(homedir(), item.slice(1))}` : item);
  const projects = find(`${paths}/**/*.sublime-project`, { absolute: true });

  return projects.map((path) => {
    const relativePath = path;
    const parsedRelativePath = parsePath(relativePath);
    const name = parsedRelativePath.name;
    const fileName = parsedRelativePath.base;
    const workspace = `${parsedRelativePath.dir}.sublime-workspace`
    return {
      name,
      fileName,
      relativePath,
      workspace
    };
  });
};

export interface Results {
  packages: Package[]
  page: number
  count: number
  begin: number
  end: number
  total: number
  pages: number
  links: Link[]
  terms: string
  sort: string
}

export interface Package {
  name: string
  highlighted_name: string
  highlighted_description: string
  highlighted_authors: string[]
  authors: string[]
  labels: string[]
  platforms: string[]
  st_versions: number[]
  last_modified: string
  first_seen: string
  is_missing: boolean
  missing_error: string
  needs_review: boolean
  trending_rank?: number
  installs_rank: number
  unique_installs: number
  relevance: number
  homepage: string
  readme: string
  issues: string
  donate: string
  readme_html: string
}

export interface Link {
  number: number
  href: string
  selected: boolean
}

export const returnPackageInfo = async (pkg: string): Promise<Package | null> => {
  try {
    if (pkg != "") {
      const response = await fetch(
        `https://packagecontrol.io/packages/${pkg}.json`
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const json: any = await response.json();
      return json as Package;
    } else {
      return null
    }
  } catch (error) {
    showToast(Toast.Style.Failure, "An error occured", "Could not fetch package control results");
    return null
  }
};

export const returnPackages = async (searchTerm: string): Promise<Results | null> => {
  try {
    if (searchTerm != "") {
      const response = await fetch(
        `https://packagecontrol.io/search/${searchTerm}.json`
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const json: any = await response.json();
      return json as Results;
    } else {
      return null
    }
  } catch (error) {
    showToast(Toast.Style.Failure, "An error occured", "Could not fetch package control results");
    return null
  }
};

export function generateAccessories(pkg: Package) {
  let results = []
  const rank = parseInstallRank(pkg.installs_rank)

  if (pkg.is_missing) {
    results.push({
      icon: "missing.png",
      tooltip: "Package Missing"
    })
  }

  if (rank !== null && rank !== undefined) {
    if (rank <= 25) {
      results.push({
        icon: "top_25.png",
        tooltip: "Top 25 Packages"
      })
    } else if (rank <= 100 && rank > 25) {
      results.push({
        icon: "top_100.png",
        tooltip: "Top 100 Packages"
      })
    }
  }
  return results
}

export function parseInstallRank(installs_rank: number | null | undefined): number | null {
  if (installs_rank === null || installs_rank === undefined) {
    return null
  }
  return installs_rank
}

export interface SublimeUpdates {
  updates: Array<Updates>
}
export interface Updates {
  latest_version: number
  license_lapse_timestamp: number
  last_license_number_lapsed: number
  update_url: string
  manifest_host: string
  update_host: string
  manifest_path_osx: string
  update_path_osx: string
  manifest_path_windows_x64: string
  update_path_windows_x64: string
  manifest_path_windows_x32: string
  update_path_windows_x32: string
}

export const returnStableSublimeUpdates = async (): Promise<Updates | null> => {
  try {
    const response = await fetch(
      `https://www.sublimetext.com/updates/4/stable_update_check`
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const json: any = await response.json();
    return json as Updates;
  } catch (error) {
    showToast(Toast.Style.Failure, "An error occured", "Could not fetch sublime updates");
    return null
  }
}

export const returnDevSublimeUpdates = async (): Promise<Updates | null> => {
  try {
    const response = await fetch(
      `https://www.sublimetext.com/updates/4/dev_update_check`
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const json: any = await response.json();
    return json as Updates;
  } catch (error) {
    showToast(Toast.Style.Failure, "An error occured", "Could not fetch sublime updates");
    return null
  }
}

export const returnSublimeUpdates = async (): Promise<SublimeUpdates | null> => {
  let updates = { updates: [] } as SublimeUpdates;
  const stable = await returnStableSublimeUpdates();
  const dev = await returnDevSublimeUpdates();

  if (stable !== null) {
    updates.updates.push(stable)
  }
  if (dev !== null) {
    updates.updates.push(dev)
  }
  return updates
}

export const returnChangeLog = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(
      url
    ).then((response) => {
      return response.text();
    }).then((html) => {
      const doc = parse(html);
      const changelog = doc.querySelector("#changelog")?.innerHTML;
      return NodeHtmlMarkdown.translate(changelog !== undefined ? changelog : "");
    });
    return response
  } catch (error) {
    showToast(Toast.Style.Failure, "An error occured", "Could not fetch sublime updates");
    return null
  }
}