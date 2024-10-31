# Use the official thirdweb engine image as a base
FROM thirdweb/engine:latest

# Set environment variables
# Note: These should be set in Railway's environment variables settings rather than hardcoded.
# We're keeping these as placeholders here for reference.
ENV ADMIN_WALLET_ADDRESS=0x575a9960be5f23c8e8af7f9c8712a539eb255be6 \
    THIRDWEB_API_SECRET_KEY=gx5MVGbRyxZVo2Xwvzl77zTicioxO5xPurqxU5bhku-3ZHdBKzNgr59CPTmLa6byMKWkHz0yDo5Elct\
    ENABLE_HTTPS=false \
    ENCRYPTION_PASSWORD=!Z5m8p@Qr$3dNp1&vL \
    NODE_ENV=production
    
# Expose the port the engine will run on
EXPOSE 3005

# Start the engine
CMD ["yarn", "start"]
