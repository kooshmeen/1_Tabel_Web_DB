const User = require('../models/User');

// Controller pentru operațiuni cu utilizatori
class UserController {

    // GET /api/users/tables - List all tables in the db
    static async getAllTables(req, res) {
        try {
            const tables = await User.getAllTables();
            res.json({
                success: true,
                data: tables,
                count: tables.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // GET /api/users/tables/:tableName/columns - Get columns for a specific table
    static async getTableColumns(req, res) {
        try {
            const { tableName } = req.params;
            const currentUser = req.user; // From auth middleware
            
            const columns = await User.getTableColumns(tableName, currentUser);
            
            if (!columns) {
                return res.status(404).json({
                    success: false,
                    error: 'Table not found'
                });
            }
            
            res.json({
                success: true,
                data: columns,
                message: 'Table columns retrieved successfully'
            });
        }
        catch (error) {
            console.error('❌ Error in getTableColumns controller:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // GET /api/users/tables/:tableName - Get data for a specific table
    static async getTableData(req, res) {
        try {
            const { tableName } = req.params;
            const { page = 1, limit = 50 } = req.query;
            const currentUser = req.user; // From auth middleware
            
            const tableData = await User.getTableData(tableName, currentUser, page, limit);
            
            res.json({
                success: true,
                data: tableData,
                message: 'Table data retrieved successfully'
            });
            
        } catch (error) {
            console.error('❌ Error in getTableData controller:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    
    // GET /api/users - Listează toți utilizatorii
    static async getAllUsers(req, res) {
        try {
            const users = await User.listUsers();
            res.json({
                success: true,
                data: users,
                count: users.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    
    // GET /api/users/:id - Găsește user după ID
    static async getUserById(req, res) {
        try {
            const userId = req.params.id;
            const user = await User.getUserById(userId);
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }
            
            res.json({
                success: true,
                data: user
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    
    // POST /api/users - Creează user nou
    static async createUser(req, res) {
        try {
            console.log('=== Registration Request ===');
            console.log('Request body:', req.body);
            
            const { name, email, password, userType, adminPassword } = req.body;
            
            // Basic validation
            if (!name || !email || !password) {
                console.log('❌ Basic validation failed');
                return res.status(400).json({
                    success: false,
                    error: 'Name, email and password are required'
                });
            }
            
            // Admin password validation
            if (userType === 'admin') {
                console.log('🔐 Admin registration detected');
                if (!adminPassword) {
                    console.log('❌ Admin password missing');
                    return res.status(400).json({
                        success: false,
                        error: 'Admin password is required for admin accounts'
                    });
                }
                
                const ADMIN_SECRET = process.env.ADMIN_SECRET;
                if (adminPassword !== ADMIN_SECRET) {
                    console.log('❌ Admin password incorrect');
                    return res.status(400).json({
                        success: false,
                        error: 'Invalid admin password'
                    });
                }
                console.log('✅ Admin password correct');
            }
            
            // Check if email exists
            console.log('📧 Checking email existence...');
            const emailExists = await User.emailExists(email);
            if (emailExists) {
                console.log('❌ Email already exists');
                return res.status(400).json({
                    success: false,
                    error: 'Email already exists'
                });
            }
            
            // Create user
            console.log('👤 Creating user...');
            const role = userType === 'admin' ? 'admin' : 'user';
            console.log('Role will be:', role);
            
            const user = await User.createUser({ name, email, password, role });
            
            console.log('✅ User created successfully:', user);
            res.status(201).json({
                success: true,
                data: user,
                message: 'User created successfully'
            });
            
        } catch (error) {
            console.error('💥 Registration Error:', error.message);
            console.error('Stack:', error.stack);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    
    // PUT /api/users/:id - Actualizează user
    static async updateUser(req, res) {
        try {
            const userId = req.params.id;
            const { name, email } = req.body;
            
            if (!name || !email) {
                return res.status(400).json({
                    success: false,
                    error: 'Name and email are required'
                });
            }
            
            const user = await User.updateUser(userId, { name, email });
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }
            
            res.json({
                success: true,
                data: user,
                message: 'User updated successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    
    // DELETE /api/users/:id - Șterge user
    static async deleteUser(req, res) {
        try {
            const userId = req.params.id;
            const deletedUser = await User.deleteUser(userId);
            
            if (!deletedUser) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }
            
            res.json({
                success: true,
                message: 'User deleted successfully',
                data: { id: deletedUser.id }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
    
    // POST /api/users/authenticate - Login
    static async authenticateUser(req, res) {
        try {
            const { email, password } = req.body;
            
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Email and password are required'
                });
            }
            
            const user = await User.authenticate(email, password);
            res.json({
                success: true,
                data: user,
                message: 'Authentication successful'
            });
        } catch (error) {
            res.status(401).json({
                success: false,
                error: error.message
            });
        }
    }

    // POST /api/users/tables/:tableName/rows - Create new row in specific table
    static async addTableRow(req, res) {
        try {
            const { tableName } = req.params;
            const rowData = req.body;
            const currentUser = req.user;
            
            console.log(`🆕 Adding new row to table ${tableName}:`, rowData);
            
            // Validate that user has permission to add data
            if (currentUser.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions to add data'
                });
            }
            
            // Special validation for users table - only admins can create users
            if (tableName === 'users') {
                console.log('🔐 Creating new user - admin access confirmed');
            }
            
            const result = await User.addTableRow(tableName, rowData, currentUser);
            
            res.status(201).json({
                success: true,
                data: result,
                message: 'Row added successfully'
            });
            
        } catch (error) {
            console.error('❌ Error in addTableRow controller:', error);
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    // PATCH /api/users/tables/:tableName/rows/:rowId - Update specific row
    static async updateTableRow(req, res) {
        try {
            const { tableName, rowId } = req.params;
            const updates = req.body;
            const currentUser = req.user;
            
            console.log(`🔄 Updating row ${rowId} in table ${tableName}:`, updates);
            
            const result = await User.updateTableRow(tableName, rowId, updates, currentUser);
            
            res.json({
                success: true,
                data: result,
                message: 'Row updated successfully'
            });
            
        } catch (error) {
            console.error('❌ Error in updateTableRow controller:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // DELETE /api/users/tables/:tableName/rows/:rowId - Delete specific row
    static async deleteTableRow(req, res) {
        try {
            const { tableName, rowId } = req.params;
            const currentUser = req.user;
            
            console.log(`🗑️ Deleting row ${rowId} from table ${tableName}`);
            
            const result = await User.deleteTableRow(tableName, rowId, currentUser);
            
            res.json({
                success: true,
                data: result,
                message: 'Row deleted successfully'
            });
            
        } catch (error) {
            console.error('❌ Error in deleteTableRow controller:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // POST /api/users/tables/join - Get joined table data
    static async getJoinedTableData(req, res) {
        try {
            const { tableNames } = req.body;
            const { page = 1, limit = 50 } = req.query;
            const currentUser = req.user; // From auth middleware
            
            if (!Array.isArray(tableNames) || tableNames.length < 2) {
                return res.status(400).json({
                    success: false,
                    error: 'At least 2 table names are required for join operation'
                });
            }
            
            const joinedData = await User.getJoinedTableData(tableNames, currentUser, page, limit);
            
            res.json({
                success: true,
                data: joinedData,
                message: 'Joined table data retrieved successfully'
            });
            
        } catch (error) {
            console.error('❌ Error in getJoinedTableData controller:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    // GET /api/users/tables/relationships - Get table relationships
    static async getTableRelationships(req, res) {
        try {
            const relationships = await User.getTableRelationships();
            
            res.json({
                success: true,
                data: relationships,
                message: 'Table relationships retrieved successfully'
            });
            
        } catch (error) {
            console.error('❌ Error in getTableRelationships controller:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    
}

module.exports = UserController;