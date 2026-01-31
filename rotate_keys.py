import asyncio
import coc
import subprocess
import os

async def rotate_clash_key():
    email = os.environ.get("COC_EMAIL")
    password = os.environ.get("COC_PASSWORD")
    worker_name = "clash-mcp-server" # Change to your actual worker name

    async with coc.Client() as client:
        try:
            # Logs in and ensures a key exists for the current runner's IP
            await client.login(email, password)
  
            keys = client.http.keys
            try:
                key_info = keys[0]
            except TypeError:
                key_info = next(keys)
            
            new_token = key_info.key if hasattr(key_info, "key") else key_info
            
            # Update the secret in Cloudflare using Wrangler
            process = subprocess.run(
                ["npx", "wrangler", "secret", "put", "CLASH_API_KEY", "--name", worker_name],
                input=new_token.encode(),
                check=True,
                capture_output=True
            )
            print("✅ Successfully rotated key and updated Cloudflare secret.")
            
        except Exception as e:
            print(f"❌ Error during rotation: {e}")

if __name__ == "__main__":
    asyncio.run(rotate_clash_key())