# 🚀 Onboarding Guide

Follow these steps to get your own instance of the Clash of Clans MCP server up and running!

## Step 1: Set Up the Relay

Since Cloudflare Workers don't have a static IP address, we need to route requests through a relay with a stable address that we can whitelist in the Clash of Clans Developer portal. We'll use `ngrok` to create a secure tunnel to our local machine.

1.  **Install ngrok:** If you don't have it, download and install it from the [ngrok website](https://ngrok.com/download).

2.  **Expose your local relay server:** Open a terminal and run the following command to point ngrok to your local port 3000.
    ```bash
    ngrok http 3000
    ```
3.  **Start the relay:** In another terminal, start the local relay server.
    ```bash
    node relay.js
    ```
Keep both of these terminals running. ngrok will give you a public URL (e.g., `https://random-string.ngrok-free.app`)—copy it for the next steps.

> **Note:** If you have a server with a static IP, you can deploy `relay.js` there and use your server's IP address instead of ngrok.

## Step 2: Get a Clash of Clans API Key

1.  **Create a developer account:** Go to the [Clash of Clans Developer Portal](https://developer.clashofclans.com/) and create an account.

2.  **Create an API Key:** Once logged in, create a new API key.

3.  **Whitelist your IP:** This is a crucial step. In the key creation screen, you must add the IP address from your ngrok tunnel to the list of allowed IPs.

    When you run ngrok, it provides a "Forwarding" URL. To find the IP address to whitelist, you can either:
    *   **Use the `ping` command:** Open a new terminal and ping the hostname of your forwarding URL (the part after `https://` and before `.ngrok-free.app`). For example:
        ```bash
        ping random-string.ngrok-free.app
        ```
        The IP address returned by the ping is what you need to whitelist.
    *   **Check the ngrok dashboard:** Log in to your [ngrok Dashboard](https://dashboard.ngrok.com/tunnels/agents) online, and you can see the IP addresses of your active tunnels.

## Step 3: Create and Deploy the Cloudflare Worker

1.  **Log in to Cloudflare:** Go to your [Cloudflare Dashboard](https://dash.cloudflare.com/).

2.  **Create a Worker:** Navigate to the "Workers & Pages" section and click "Create application". Choose "Create Worker" and give it a name.

3.  **Add the Worker Code:** Copy the entire content of the `worker.js` file from this project and paste it into the Cloudflare editor, replacing any default code.

4.  **Add Secrets and Variables:**
    *   Go to your worker's **Settings** -> **Variables**.
    *   Add a secret for your API key:
        *   **Variable name:** `CLASH_API_KEY`
        *   **Value:** Your Clash of Clans API key from Step 2.
        *   Click "Encrypt" to save it securely.
    *   Add a variable for the proxy URL:
         *   **Variable name:** `PROXY_URL`
         *   **Value:** Your ngrok forwarding URL from Step 1 (e.g., `https://random-string.ngrok-free.app`).

5.  **Deploy:** Save and deploy your worker! Your Clash of Clans server is now live.

## (Optional) Local Development

To run and test the worker on your local machine without `ngrok`:

1.  **Create and configure `.dev.vars` file:** 
    *   In the root of the project, create a new file named `.dev.vars` if it doesn't exist.
    *   Add your API key and set the `PROXY_URL` to your local relay server.
        ```
        CLASH_API_KEY="<your-clash-of-clans-api-key>"
        PROXY_URL="http://localhost:3000"
        ```
2.  **Whitelist your Network IP:** When running the worker locally, requests to the Clash of Clans API are relayed through your local machine. Therefore, you must add **your computer's public IP address** to the allowed list in the [Clash of Clans Developer Portal](https://developer.clashofclans.com/).

3.  **Run the Relay and Worker:**
    *   Start the relay server in a terminal:
        ```bash
        node relay.js
        ```
    *   In another terminal, start the worker with Wrangler:
        ```bash
        wrangler dev
        ```

# Available tools

## get-player
Obtains information for a given player tag and summarizes it.

## get-clan
Obtains information for a given clan and summarizes it.

## clan-war-league-info
Obtains information about the most recent CWL rounds.

## clan-war-league-war
Obtains information about a specific CWL war based on the round.

## get-current-war
Gets the current war info for the clan (provided it is public).

## get-war-log
Gets a clan's war log (provided it is public).

## get-capital-raids
Gets information regarding the clan's capital raids.

# Available prompts

## analyze-current-war
Analyzes the current war. Provides an overview with the stats, top-performers, and potential strategy changes.

## analyze-war-log
Analyzes a clan's war log and summarizes its overall performance.

## analyze-cwl-war
Analyzes a given CWL war and summarizes the clan's overall performance in that war.

## analyze-player
Analyzes a player's statistics and suggests scope for improvement.

## analyze-clan
Analyzes a given clan and assesses it based on the members, their TH levels, war record, etc.

## analyze-capital-raids
Analyzes a clan's last few capital raids (3 by default).
