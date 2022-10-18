import { showToast, Toast } from '@raycast/api';
import { sync as find } from 'fast-glob';
import { homedir } from 'os';
import { parse as parsePath } from 'path';
import { useEffect, useState } from 'react';
import { getPreferences } from './preferences';
import path = require('path');
import Style = Toast.Style;

export interface SublimeTextProject {
    name: string;
    relativePath: string;
    fileName: string;
    workspace: string;
}

export const listSublimeProjects = (): SublimeTextProject[] => {
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

export const useSublimeProjects = () => {
    const [projects, setProjects] = useState<SublimeTextProject[]>([]);

    useEffect(() => {
        try {
            const result = listSublimeProjects();
            setProjects(result);
        } catch (error: unknown) {
            void showToast({ style: Style.Failure, title: 'Failed to load projects', message: (error as Error).message });
        }
    }, []);

    return [projects];
};