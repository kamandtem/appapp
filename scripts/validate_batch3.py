#!/usr/bin/env python3
"""Validate batch3 records, assets, and uniqueness against imported batch1/2."""
from pathlib import Path
import json, re
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'src/data/importedBatch3Poses.ts'
PREV=ROOT/'src/data/importedPoses.ts'
IMG=ROOT/'public/generated/photos'
src=SRC.read_text()
start=src.index('= ')+2
records=json.loads(src[start:].rstrip(' ;\n'))
assert len(records)==57, f'record count {len(records)}'
required=['id','title','image','imageRatio','category','poseType','peopleCount','locations','scenario','gardenSubCategory','framing','mood','movement','environment','tags','steps','bodyPosition','handPosition','footPosition','headDirection','eyeDirection','photographerScript','commonMistakes','variations','cameraTips','ease','stage','transferCode']
assert all(not [k for k in required if k not in r] for r in records)
assert len({r['id'] for r in records})==57
assert len({r['transferCode'] for r in records})==57
assert all(r['transferCode']==f'batch3-{i:03d}' for i,r in enumerate(records,1))
assert all(r['id']==f'batch3-{i:03d}' for i,r in enumerate(records,1))
assert all(r['locations']==['باغ عمارت'] and r['suitableLocations']==['باغ عمارت'] for r in records)
assert all(len(r['tags'])>=6 for r in records)
assert all(r['imageRatio']=='4/3' for r in records)
assert all(r['image']==f'/generated/photos/batch3-{i:03d}.webp' for i,r in enumerate(records,1))
assert records[38]['peopleCount']==0
# Existing imported IDs/codes must not collide with batch3.
prev=PREV.read_text()
prev_ids=set(re.findall(r'"id":\s*"([^"]+)"',prev))
prev_codes=set(re.findall(r'"transferCode":\s*"([^"]+)"',prev))
assert not ({r['id'] for r in records}&prev_ids)
assert not ({r['transferCode'] for r in records}&prev_codes)
for i,r in enumerate(records,1):
    p=IMG/f'batch3-{i:03d}.webp'
    assert p.exists(), p
    with Image.open(p) as im:
        assert im.size==(1200,900), (p,im.size)
print(json.dumps({'records':len(records),'images':57,'dimensions':'1200x900','min_tags':min(map(lambda r:len(r['tags']),records)),'location':'باغ عمارت','unique_new_ids':57,'unique_new_transfer_codes':57,'collisions_with_previous_ids':0,'collisions_with_previous_transfer_codes':0,'peopleCount_39':records[38]['peopleCount']},ensure_ascii=False,indent=2))
