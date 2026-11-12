from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse,unquote
import json
root=Path(__file__).resolve().parents[1]/'site'
class Links(HTMLParser):
 def __init__(self):super().__init__();self.links=[]
 def handle_starttag(self,tag,attrs):
  for k,v in attrs:
   if k in ('src','href') and v:self.links.append((tag,v))
broken=[]
for f in root.rglob('*.html'):
 p=Links();p.feed(f.read_text())
 for tag,v in p.links:
  u=urlparse(v)
  if u.scheme or u.netloc or not u.path or u.path.startswith('/.netlify/'):continue
  target=(root/u.path.lstrip('/')) if u.path.startswith('/') else f.parent/u.path
  if not target.exists() and not target.with_suffix('.html').exists():broken.append([str(f.relative_to(root)),v])
result={'pages':len(list(root.rglob('*.html'))),'broken_local_links':broken}
(root.parent/'qa/current-static-results.json').write_text(json.dumps(result,indent=2));print(json.dumps(result,indent=2));raise SystemExit(bool(broken))
