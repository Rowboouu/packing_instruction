import * as libreImport from 'libreoffice-convert';
import { promisify } from 'util';

const libre = libreImport as any;
libre.convertAsync = promisify(libreImport.convert);

export { libre };
