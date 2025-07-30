#!/bin/bash

echo "Applying analytics migration..."
echo ""

# Set environment variables if not already set
if [ -z "$DATABASE_URL" ]; then
    echo "Warning: DATABASE_URL not set. Using default local PostgreSQL."
    export DATABASE_URL="postgresql://postgres:password@localhost:5432/minicoder"
fi

echo "Running analytics migration..."
psql "$DATABASE_URL" -f migration_add_analytics.sql

if [ $? -eq 0 ]; then
    echo "✅ Analytics migration applied successfully!"
    echo ""
    echo "Regenerating Prisma client..."
    npx prisma generate
    
    if [ $? -eq 0 ]; then
        echo "✅ Prisma client regenerated successfully!"
        echo ""
        echo "Analytics backend is now ready!"
        echo "- Analytics events table created"
        echo "- Indexes added for performance"
        echo "- Prisma client updated"
    else
        echo "❌ Failed to regenerate Prisma client"
    fi
else
    echo "❌ Failed to apply analytics migration"
    echo "Please check your database connection and try again."
fi
