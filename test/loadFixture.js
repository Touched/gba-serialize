import path from 'path';

export default function loadFixture(name: string): string {
  return path.join(__dirname, 'fixtures', name);
}
