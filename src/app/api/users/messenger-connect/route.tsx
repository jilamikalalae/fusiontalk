import { NewResponse } from "@/types/api-response";
import { NextRequest } from "next/server";
import connectMongoDB  from '@/lib/mongodb';
import User from '@/models/user';
import { AuthOptions, getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { EncryptString } from '@/lib/crypto';

export async function POST(req:NextRequest) {
    try{
        const { accessToken, pageId } = await req.json();

        if(!accessToken || !pageId) {
            return NewResponse(400, null, 'All fields are required.')
        }

        const session = await getServerSession(authOptions as AuthOptions);
        if(!session) {
            return NewResponse(401, null, null)
        }

        const id = session?.user.id;

        await connectMongoDB();

        const existingUser = await User.findById(id);

        if(!existingUser) {
            return NewResponse(404, null, null);
        }

        const encryptAccessToken = EncryptString(accessToken)

        let messengerToken = {} as any;
        messengerToken.accessToken = encryptAccessToken.encrypted;
        messengerToken.accessTokenIv = encryptAccessToken.iv;
        messengerToken.pageId = pageId
        existingUser.messengerToken = messengerToken;

        await existingUser.save();
        return NewResponse(200, null, null)
    } catch (error:any) {
        console.error('Error connecting Messenger account:', error);
        return NewResponse(500, null, error.message);
    }

}


export async function PUT(req:NextRequest) {
    try{
        const session = await getServerSession(authOptions as AuthOptions);
        if (!session) {
            return NewResponse(401, null, 'Unauthorized');
        }
        const id = session?.user.id;

        await connectMongoDB();

        const user = await User.findByIdAndUpdate(id, {messengerToken : null});

        return NewResponse(200, null, null)
    } catch (error) {
        console.error('Error delete messenger token:', error);
        return NewResponse(500,null,'Failed to delete messenger token Please try again later.' )
    }
    
}