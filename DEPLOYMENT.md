# Fantasy Vault Trade - Vercel Deployment Guide

This guide provides step-by-step instructions for deploying the Fantasy Vault Trade application to Vercel.

## Prerequisites

- GitHub account with access to the repository
- Vercel account (free tier available)
- Node.js 18+ installed locally (for testing)
- MetaMask or compatible wallet for testing

## Step 1: Prepare the Repository

1. **Ensure all code is committed and pushed to GitHub:**
   ```bash
   git add .
   git commit -m "feat: Ready for deployment"
   git push origin main
   ```

2. **Verify the repository structure:**
   - `package.json` with correct dependencies
   - `src/` directory with all source files
   - `public/` directory with favicon and assets
   - `contracts/` directory with FHE smart contracts

## Step 2: Create Vercel Account and Connect Repository

1. **Visit Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up or log in with your GitHub account

2. **Import Project:**
   - Click "New Project"
   - Select "Import Git Repository"
   - Choose `stevenjohnston33/fantasy-vault-trade`
   - Click "Import"

## Step 3: Configure Build Settings

1. **Framework Preset:**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

2. **Root Directory:**
   - Leave as default (root of repository)

## Step 4: Environment Variables Configuration

Add the following environment variables in Vercel dashboard:

### Required Environment Variables

```bash
# Chain Configuration
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/b18fb7e6ca7045ac83c41157ab93f990

# Wallet Connect Configuration
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=2ec9743d0d0cd7fb94dee1a7e6d33475

# Infura Configuration
NEXT_PUBLIC_INFURA_API_KEY=b18fb7e6ca7045ac83c41157ab93f990
NEXT_PUBLIC_RPC_URL=https://1rpc.io/sepolia

# Contract Configuration (Update after deployment)
NEXT_PUBLIC_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000

# FHE Configuration
NEXT_PUBLIC_FHE_NETWORK_URL=https://api.zama.ai
NEXT_PUBLIC_FHE_APP_ID=fantasy-vault-trade

# Application Configuration
NEXT_PUBLIC_APP_NAME=Fantasy Vault Trade
NEXT_PUBLIC_APP_DESCRIPTION=Privacy-focused fantasy trading platform with FHE encryption
NEXT_PUBLIC_APP_URL=https://fantasy-vault-trade.vercel.app
```

### How to Add Environment Variables:

1. In Vercel dashboard, go to your project
2. Click on "Settings" tab
3. Click on "Environment Variables" in the sidebar
4. Add each variable with the following settings:
   - **Name**: The variable name (e.g., `NEXT_PUBLIC_CHAIN_ID`)
   - **Value**: The variable value (e.g., `11155111`)
   - **Environment**: Select all environments (Production, Preview, Development)

## Step 5: Deploy the Application

1. **Initial Deployment:**
   - Click "Deploy" button
   - Wait for the build process to complete (usually 2-5 minutes)
   - Monitor the build logs for any errors

2. **Verify Deployment:**
   - Once deployed, you'll get a URL like `https://fantasy-vault-trade-xxx.vercel.app`
   - Click the URL to test the application

## Step 6: Configure Custom Domain (Optional)

1. **Add Custom Domain:**
   - In Vercel dashboard, go to "Settings" > "Domains"
   - Add your custom domain (e.g., `fantasy-vault-trade.com`)
   - Follow DNS configuration instructions

2. **Update Environment Variables:**
   - Update `NEXT_PUBLIC_APP_URL` with your custom domain

## Step 7: Smart Contract Deployment

### Deploy FHE Contract to Sepolia

1. **Install Hardhat (if not already installed):**
   ```bash
   npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
   ```

2. **Create Hardhat Configuration:**
   ```javascript
   // hardhat.config.js
   require("@nomicfoundation/hardhat-toolbox");
   
   module.exports = {
     solidity: "0.8.24",
     networks: {
       sepolia: {
         url: "https://sepolia.infura.io/v3/b18fb7e6ca7045ac83c41157ab93f990",
         accounts: ["YOUR_PRIVATE_KEY"]
       }
     }
   };
   ```

3. **Deploy Contract:**
   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```

4. **Update Contract Address:**
   - Copy the deployed contract address
   - Update `NEXT_PUBLIC_CONTRACT_ADDRESS` in Vercel environment variables
   - Redeploy the application

## Step 8: Testing and Verification

### Local Testing

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start Development Server:**
   ```bash
   npm run dev
   ```

3. **Test Features:**
   - Wallet connection with RainbowKit
   - FHE encryption/decryption
   - Contract interactions
   - UI responsiveness

### Production Testing

1. **Test on Vercel URL:**
   - Connect wallet
   - Test trading functionality
   - Verify FHE encryption works
   - Check mobile responsiveness

2. **Performance Testing:**
   - Use Lighthouse for performance audit
   - Test loading times
   - Verify all features work correctly

## Step 9: Monitoring and Maintenance

### Set Up Monitoring

1. **Vercel Analytics:**
   - Enable Vercel Analytics in dashboard
   - Monitor performance metrics
   - Track user interactions

2. **Error Tracking:**
   - Consider adding Sentry for error tracking
   - Monitor console errors
   - Set up alerts for critical issues

### Regular Maintenance

1. **Update Dependencies:**
   ```bash
   npm update
   npm audit fix
   ```

2. **Security Updates:**
   - Regularly update wallet dependencies
   - Monitor for security vulnerabilities
   - Update FHE libraries as needed

## Troubleshooting

### Common Issues

1. **Build Failures:**
   - Check Node.js version (should be 18+)
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Environment Variable Issues:**
   - Ensure all `NEXT_PUBLIC_` variables are set
   - Verify variable names match exactly
   - Check for typos in values

3. **Wallet Connection Issues:**
   - Verify WalletConnect Project ID
   - Check RPC URL configuration
   - Ensure MetaMask is installed

4. **FHE Integration Issues:**
   - Verify FHE network configuration
   - Check contract deployment
   - Ensure proper encryption/decryption

### Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [RainbowKit Documentation](https://www.rainbowkit.com/docs/introduction)
- [FHE Documentation](https://docs.zama.ai/fhevm)
- [Wagmi Documentation](https://wagmi.sh)

## Deployment Checklist

- [ ] Repository is clean and up-to-date
- [ ] All environment variables are configured
- [ ] Build settings are correct
- [ ] Smart contract is deployed
- [ ] Contract address is updated
- [ ] Application is tested locally
- [ ] Production deployment is successful
- [ ] All features are working
- [ ] Performance is acceptable
- [ ] Monitoring is set up

## Next Steps After Deployment

1. **Marketing:**
   - Share on social media
   - Submit to DeFi directories
   - Create documentation

2. **User Onboarding:**
   - Create user guides
   - Add help documentation
   - Set up support channels

3. **Feature Enhancements:**
   - Gather user feedback
   - Plan future updates
   - Implement improvements

---

**Note:** This deployment guide assumes you have the necessary permissions and access to deploy the application. Make sure to follow all security best practices and keep sensitive information (like private keys) secure.
