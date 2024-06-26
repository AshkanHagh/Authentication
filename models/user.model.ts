import { Model, Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt, { type Secret } from 'jsonwebtoken';
import type { IUserModel } from '../types';

const UserSchema = new Schema<IUserModel>({
    name : {
        type : String,
        required : [true, 'Please enter your name']
    },
    email : {
        type : String,
        required : [true, 'Please enter your email'],
        unique : true
    },
    password : {
        type : String,
        minlength : [6, 'Password most be at least 6 characters'],
        select : false
    },
    role : {
        type : String,
        default : 'user'
    }

}, {timestamps : true});


UserSchema.pre<IUserModel>('save', async function(next) {
    if(!this.isModified('password')) {
        next();
    }

    this.password = await bcrypt.hash(this.password, 10);
    next();
});

UserSchema.methods.SignAccessToken = function () {
    return jwt.sign({id : this._id}, process.env.ACCESS_TOKEN as Secret || '', {expiresIn : '5m'});
}

UserSchema.methods.SignRefreshToken = function () {
    return jwt.sign({id : this._id}, process.env.REFRESH_TOKEN as Secret || '', {expiresIn : '3d'});
}

UserSchema.methods.comparePassword = async function (enteredPassword : string) : Promise<boolean> {
    return await bcrypt.compare(enteredPassword, this.password);
}

const User : Model<IUserModel> = model('User', UserSchema);

export default User;