// 回答一个问题：当前 HEAD 到底有没有值得发出去的东西？
//
// 「该发版了」在别处是个意见，在这里是一次能复核的检查 —— 只看两件事实：
// 上一个 tag 之后 lib/ 或 dist/ 有没有变，CHANGELOG 的「## 未发布」里有没有用户能看见的条目。
// 两样都没有就退出码 1（没有可发的东西），这样 agent 可以照着退出码判断，而不是照着感觉判断。
//
// 它不判断该发补丁还是次版本还是主版本：那取决于变化是不是纯加法，只有读 diff 的人能定。

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const ROOT = new URL('../', import.meta.url);

function git(args) {
  try {
    return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}

function unreleasedEntries() {
  const text = readFileSync(new URL('CHANGELOG.md', ROOT), 'utf8');
  const start = text.search(/^## 未发布\s*$/m);
  if (start === -1) return null; // 标题已经改成版本号，说明这一版已经封版
  const rest = text.slice(start).split('\n').slice(1);
  const stop = rest.findIndex((line) => /^## /.test(line));
  const body = stop === -1 ? rest : rest.slice(0, stop);
  return body.filter((line) => line.trim().startsWith('- ')).length;
}

const packageVersion = JSON.parse(readFileSync(new URL('package.json', ROOT), 'utf8')).version;
const lastTag = git(['describe', '--tags', '--abbrev=0']);
const shipped = lastTag ? git(['diff', '--name-only', `${lastTag}..HEAD`, '--', 'lib', 'dist']) : null;
const shippedFiles = shipped === null ? [] : shipped.split('\n').filter(Boolean);
const entries = unreleasedEntries();
const ahead = git(['rev-list', '--count', lastTag ? `${lastTag}..HEAD` : 'HEAD']);

const lines = [
  `package.json version       ${packageVersion}`,
  `上一个 tag                  ${lastTag ?? '（没有 tag，或 git 不可用）'}`,
  `之后未发的提交              ${ahead ?? '?'}`,
  `lib/ 与 dist/ 的变更文件    ${lastTag ? shippedFiles.length : '?（缺 tag，无法比较）'}`,
  `CHANGELOG「未发布」条目     ${entries === null ? '（标题已改成本版本号，视为已封版）' : entries}`,
];

if (!lastTag) {
  lines.push('', '判定：无法判断 —— 先确认 git 可用、仓库里有 tag。');
  console.log(lines.join('\n'));
  process.exit(2);
}

// 硬信号只有 lib/ 与 dist/：包里就这两样，它们没变，发出去的 tarball 除了版本号都一样。
const hasShippedChange = shippedFiles.length > 0;

if (hasShippedChange) {
  lines.push(
    '',
    '判定：有东西可发。版本级别要人来定 —— 纯新增导出/选项是次版本，结果改变或签名改变是主版本。',
    '顺序：改 version → CHANGELOG 标题换成 ## v<version> → 提交 → 跑一次 rehearsal（workflow_dispatch，dry_run 打开）。',
    '打 tag、批准 environment、在 npmjs.com 批准 staged 版本，这三步不属于 agent。',
    `变更的文件：${shippedFiles.join(', ')}`,
  );
  if ((entries ?? 0) === 0) {
    lines.push('但 CHANGELOG 里没有对应条目：发版前先补一条，写「用户看到什么变了」。');
  }
} else {
  lines.push('', '判定：没有值得发出去的东西 —— lib/ 与 dist/ 自上一个 tag 起没变，发出去等于只换个版本号。');
  if ((entries ?? 0) > 0) {
    lines.push('CHANGELOG 那些条目（文档、CI、规则类）随下一次真改动一起发，不必为了它们单独出一版。');
  }
}

console.log(lines.join('\n'));
process.exit(hasShippedChange ? 0 : 1);
