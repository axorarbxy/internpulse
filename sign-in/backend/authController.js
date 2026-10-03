const User = require('./User');
const bcrypt = require('../../backend/node_modules/bcryptjs');
const jwt = require('../../backend/node_modules/jsonwebtoken');

const roles = ['STUDENT', 'COMPANY', 'INSTITUTION', 'ADMIN'];
const jwtSecret = process.env.JWT_SECRET;
const Student = require('../../backend/models/Student');
const Company = require('../../backend/models/Company');
const Institution = require('../../backend/models/Institution');
const organizationRegistrations = require('../../backend/models/OrganizationRegistration');

const publicUser = (user) => ({ id: user.id, name: user.name, email: user.email, role: user.role });

const register = async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const role = String(req.body.role || '').trim().toUpperCase();
    if (!name || !email || !password || !role) return res.status(400).json({ message: 'Name, email, password and role are required' });
    if (!roles.includes(role)) return res.status(400).json({ message: 'Invalid role' });
    if (role === 'ADMIN') return res.status(403).json({ message: 'Administrator accounts are provisioned by a system owner' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
    if (await User.findUserByEmail(email)) return res.status(409).json({ message: 'User already exists' });
    const user = await User.createUser(name, email, await bcrypt.hash(password, 10), role);
    try {
      if (role === 'STUDENT') {
        await Student.upsert(user.id, req.body);
      } else if (role === 'COMPANY') {
        const companyName = String(req.body.company_name || '').trim();
        if (!companyName) {
          await User.deleteUser(user.id);
          return res.status(400).json({ message: 'Company name is required' });
        }
        await Company.upsert(user.id, { ...req.body, company_name: companyName });
        await organizationRegistrations.createPending(user.id, role, companyName, req.body);
        return res.status(202).json({ message: 'Company registration submitted for administrator approval', registrationStatus: 'PENDING', user: publicUser(user) });
      } else if (role === 'INSTITUTION') {
        const institutionName = String(req.body.institution_name || '').trim();
        if (!institutionName) {
          await User.deleteUser(user.id);
          return res.status(400).json({ message: 'Institution name is required' });
        }
        await Institution.upsert(user.id, { ...req.body, institution_name: institutionName });
        await organizationRegistrations.createPending(user.id, role, institutionName, req.body);
        return res.status(202).json({ message: 'Institution registration submitted for administrator approval', registrationStatus: 'PENDING', user: publicUser(user) });
      }
    } catch (error) {
      await User.deleteUser(user.id).catch(() => {});
      throw error;
    }
    return res.status(201).json({ message: 'Registration successful', token: jwt.sign({ id: user.id, role: user.role }, jwtSecret, { expiresIn: '1d' }), user: publicUser(user) });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

const me = async (req, res) => {
  try {
    const user = await User.findUserById(req.user.id);
    if (!user) return res.status(401).json({ message: 'Account is no longer available' });
    return res.json({ user: publicUser(user) });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });
    const user = await User.findUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password_hash))) return res.status(401).json({ message: 'Invalid email or password' });
    if (['COMPANY', 'INSTITUTION'].includes(user.role)) {
      const registration = await organizationRegistrations.byUserId(user.id);
      if (registration?.status === 'PENDING') return res.status(403).json({ message: 'Your organization account is awaiting administrator approval' });
      if (registration?.status === 'REJECTED') return res.status(403).json({ message: 'Your organization account was not approved' });
    }
    return res.json({ message: 'Login successful', token: jwt.sign({ id: user.id, role: user.role }, jwtSecret, { expiresIn: '1d' }), user: publicUser(user) });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login, me };