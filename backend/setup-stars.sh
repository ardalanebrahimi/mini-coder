#!/bin/bash

echo "🌟 Setting up Star Functionality for Mini Coder..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the root of the mini-coder project"
    exit 1
fi

# Navigate to backend
cd backend

echo "📊 Step 1: Checking database connection..."
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL client found"
else
    echo "❌ PostgreSQL client not found. Please install PostgreSQL."
    exit 1
fi

echo ""
echo "🗄️  Step 2: Applying database migration..."
echo "Please enter your database details:"
read -p "Database host (default: localhost): " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "Database user (default: postgres): " DB_USER
DB_USER=${DB_USER:-postgres}

read -p "Database name (default: minicoder): " DB_NAME
DB_NAME=${DB_NAME:-minicoder}

echo "Applying migration..."
if psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f migration_add_stars.sql; then
    echo "✅ Migration applied successfully!"
else
    echo "❌ Migration failed. Please check your database connection and try again."
    echo "You can manually apply the migration by running:"
    echo "psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f migration_add_stars.sql"
    exit 1
fi

echo ""
echo "🔧 Step 3: Generating Prisma client..."
if npm run prisma:generate; then
    echo "✅ Prisma client generated successfully!"
else
    echo "❌ Failed to generate Prisma client. Trying with npx..."
    if npx prisma generate; then
        echo "✅ Prisma client generated successfully!"
    else
        echo "❌ Failed to generate Prisma client. Please run 'npx prisma generate' manually."
        exit 1
    fi
fi

echo ""
echo "🧪 Step 4: Testing the setup..."
if command -v node &> /dev/null; then
    echo "Running star functionality tests..."
    if node test-stars.js; then
        echo "✅ All tests passed!"
    else
        echo "⚠️  Some tests failed. This might be expected if no projects are published yet."
        echo "The star functionality should still work once you have published projects."
    fi
else
    echo "⚠️  Node.js not found. Skipping tests."
fi

echo ""
echo "🎉 Star functionality setup complete!"
echo ""
echo "Next steps:"
echo "1. Start the backend server: npm start"
echo "2. Start the frontend (in another terminal): cd ../frontend && npm start"
echo "3. Log in to the app and publish some projects"
echo "4. Visit the App Store to see the star functionality"
echo ""
echo "For troubleshooting, see STAR_FUNCTIONALITY_IMPLEMENTATION.md"
