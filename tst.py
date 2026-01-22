#!/usr/bin/env python3
import argparse
import json
import subprocess
import sys
from typing import Iterable, List


def chunked(items: List[str], size: int) -> Iterable[List[str]]:
    for i in range(0, len(items), size):
        yield items[i : i + size]


def extract_face_ids(payload: dict) -> List[str]:
    faces = payload.get("Faces", [])
    face_ids: List[str] = []
    for f in faces:
        fid = f.get("FaceId")
        if fid:
            face_ids.append(fid)
    return face_ids


def build_commands(
    face_ids: List[str], collection_id: str, region: str, batch_size: int
) -> List[List[str]]:
    commands: List[List[str]] = []
    for batch in chunked(face_ids, batch_size):
        cmd = [
            "aws",
            "rekognition",
            "delete-faces",
            "--collection-id",
            collection_id,
            "--region",
            region,
            "--face-ids",
            *batch,
        ]
        commands.append(cmd)
    return commands


def pretty_cmd(cmd: List[str]) -> str:
    # Quote only where needed for readability
    def q(x: str) -> str:
        if any(c in x for c in [" ", '"', "'"]):
            return '"' + x.replace('"', '\\"') + '"'
        return x

    return " ".join(q(x) for x in cmd)


def main() -> int:
    p = argparse.ArgumentParser(
        description="Preview AWS CLI delete-faces command(s) from Rekognition JSON, and optionally execute after confirmation."
    )
    p.add_argument(
        "--collection-id",
        required=True,
        help="Rekognition CollectionId (e.g., beetroot-faces)",
    )
    p.add_argument(
        "--region", default="us-east-1", help="AWS region (default: us-east-1)"
    )
    p.add_argument(
        "--input", default="-", help="Path to JSON file (default: '-' = stdin)"
    )
    p.add_argument(
        "--batch-size",
        type=int,
        default=100,
        help="FaceIds per delete-faces call (default: 100)",
    )
    p.add_argument(
        "--execute",
        action="store_true",
        help="Actually run the command(s) after preview + confirmation",
    )
    p.add_argument(
        "--yes",
        action="store_true",
        help="Skip confirmation prompt (only works with --execute)",
    )
    args = p.parse_args()

    # Read JSON
    if args.input == "-":
        payload = json.load(sys.stdin)
    else:
        with open(args.input, "r", encoding="utf-8") as f:
            payload = json.load(f)

    face_ids = extract_face_ids(payload)
    if not face_ids:
        print("No FaceIds found in input JSON. Nothing to delete.")
        return 0

    commands = build_commands(
        face_ids, args.collection_id, args.region, args.batch_size
    )

    # Preview
    print("Preview: the following command(s) will be run:\n")
    for i, cmd in enumerate(commands, start=1):
        print(f"{i}. {pretty_cmd(cmd)}")
    print(f"\nTotal FaceIds: {len(face_ids)}")
    print(f"Total commands: {len(commands)} (batch-size={args.batch_size})\n")

    # Execute (optional)
    if not args.execute:
        print("Preview only. Re-run with --execute to actually delete faces.")
        return 0

    if not args.yes:
        confirm = input("Type DELETE to confirm execution: ").strip()
        if confirm != "DELETE":
            print("Cancelled. No commands were executed.")
            return 1

    for i, cmd in enumerate(commands, start=1):
        print(f"\nRunning {i}/{len(commands)}...")
        completed = subprocess.run(cmd, text=True)
        if completed.returncode != 0:
            print(f"Command failed with exit code {completed.returncode}. Stopping.")
            return completed.returncode

    print("\nDone. Faces deleted.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
