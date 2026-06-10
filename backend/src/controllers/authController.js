const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');
const studentModel = require('../models/studentModel');
const { signToken } = require('../utils/token');

const registerStudent = async (req, res, next) => {
  try {
    const { name, email, password, class_name } = req.body;

    if (!name || !email || !password || !class_name) {
      res.status(400);
      throw new Error("Le nom, l'adresse email, le mot de passe et la classe sont obligatoires.");
    }

    const existingUser = await userModel.findByEmail(email);

    if (existingUser) {
      res.status(400);
      throw new Error('Cet email existe deja.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.createUser({
      name,
      email,
      password: hashedPassword,
      role: 'student'
    });

    const student = await studentModel.createStudent({
      userId: user.id,
      className: class_name
    });

    const token = signToken(user);

    res.status(201).json({
      message: 'Compte etudiant cree avec succes.',
      token,
      user,
      student
    });
  } catch (error) {
    next(error);
  }
};

const registerTeacher = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Le nom, l'adresse email et le mot de passe sont obligatoires.");
    }

    const existingUser = await userModel.findByEmail(email);

    if (existingUser) {
      res.status(400);
      throw new Error('Cet email existe deja.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.createUser({
      name,
      email,
      password: hashedPassword,
      role: 'teacher'
    });

    const token = signToken(user);

    res.status(201).json({
      message: 'Compte enseignant cree avec succes.',
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('L email et le mot de passe sont obligatoires.');
    }

    const user = await userModel.findByEmail(email);

    if (!user) {
      res.status(401);
      throw new Error('Email ou mot de passe invalide.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401);
      throw new Error('Email ou mot de passe invalide.');
    }

    const token = signToken(user);

    res.json({
      message: 'Connexion reussie.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user.id);

    if (!user) {
      res.status(404);
      throw new Error('Utilisateur introuvable.');
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerStudent,
  registerTeacher,
  login,
  getCurrentUser
};
