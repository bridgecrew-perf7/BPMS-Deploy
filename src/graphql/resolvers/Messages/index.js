"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.messagesResolver = void 0;
const MessageType_1 = require("./enums/MessageType");
const getMemberNameFromContent = (content, db) => __awaiter(void 0, void 0, void 0, function* () {
    // content will be in format "members-member_id"
    const member_id = content;
    //Must find a result, otherwise, check again sending procedure
    const member = yield db.members.findOne({ _id: member_id });
    return `${member.lastName} ${member.firstName}`;
});
const getOrganizationNameAndIdFromUserId = (user_id, db) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield db.users.findOne({ _id: user_id });
    const organization = yield db.organizations.findOne({ _id: user.organization_id });
    return { organizationName: organization.name, organizationId: organization._id };
});
const handleTransferMessage = (baseMessage, db) => (from_id, 
// to_id : string, 
to_organizationId, content, action) => __awaiter(void 0, void 0, void 0, function* () {
    // Get the id of the request message to delete it 
    const idMessageToDelete = baseMessage.type + content;
    const transferMemberName = yield getMemberNameFromContent(content, db);
    const { organizationName: fromOrganizationName, organizationId: fromOrganizationId } = yield getOrganizationNameAndIdFromUserId(from_id, db);
    const user = yield db.users.findOne({ _id: from_id });
    //Generate the content base on the action that the client want the server to do
    const serverMessageContent = action === MessageType_1.ServerMessageAction.APPROVE ?
        `Yêu cầu chuyển hội viên ${transferMemberName} đến ${fromOrganizationName} được xác nhận bởi ${user.name}` :
        `Yêu cầu chuyển hội viên ${transferMemberName} đến ${fromOrganizationName} bị từ chối ${user.name}`;
    //Delete the request message from the sender 
    db.users.updateMany(//delete message
    { organization_id: fromOrganizationId }, //Delete all message from all organization
    { $pull: { "messages": { _id: idMessageToDelete } } });
    //Send back announcement so that the front end can display it
    //Client action for both case is INFO
    const serverMessage = Object.assign(Object.assign({}, baseMessage), { from_organizationId: fromOrganizationId, action: MessageType_1.ClientMessageAction.INFO, content: serverMessageContent });
    //I prefer send all message
    // db.users.findOneAndUpdate( //send back announcement
    //     { _id : from_id },
    //     { $addToSet : { messages : serverMessage }},        
    // )
    db.users.updateMany(//send back many announcement to all user in the to organization
    { organization_id: to_organizationId }, { $addToSet: { messages: serverMessage } });
    //Approve the member and set isTransfer to false if ServerMessageAction is APPROVE
    if (action === MessageType_1.ServerMessageAction.APPROVE) {
        const member_id = content;
        //The current viewer has the organization that the member want to apply for
        db.members.updateOne({ _id: member_id }, { $set: { organization_id: fromOrganizationId, isTransferring: false } }, { upsert: false });
    }
    //Update nothing if the action is decline
    return "true";
});
const handleTransferMessageRequest = (baseMessage, from_id, to_organizationId, 
// to_id : string, 
content, db) => __awaiter(void 0, void 0, void 0, function* () {
    //Basically just send a server message to the user 
    const member_id = content;
    const member = yield db.members.findOne({ _id: member_id });
    // const memberName = await getMemberNameFromContent(content, db);
    //organizationName : fromOrganizationName, 
    const { organizationId: fromOrganizationId } = yield getOrganizationNameAndIdFromUserId(from_id, db);
    // const { organizationId : toOrganizationId }       = await getOrganizationNameAndIdFromUserId(to_id, db);
    // const serverMessageContent = `Thành viên ${fromOrganizationName} muốn chuyển hội viên ${memberName}`
    //Not modify anything except for the action
    const serverMessage = Object.assign(Object.assign({}, baseMessage), { from_organizationId: fromOrganizationId, action: MessageType_1.ClientMessageAction.APPROVE_DECLINE, content: content });
    if (!member.isTransferring || member.isTransferring === undefined || member.isTransferring === null) {
        db.users.updateMany(//send forward to all user in that organization
        { organization_id: to_organizationId }, { $addToSet: { messages: serverMessage } });
        db.members.updateOne({ _id: member_id }, { $set: { isTransferring: true } }, { upsert: false });
        return "true";
    }
    return "this user is being transffered somewhere else";
});
const handleTransferMessageFromClient = (clientMessage, db) => __awaiter(void 0, void 0, void 0, function* () {
    const { type, action, from_id, to_organizationId, content } = clientMessage; //From front end, so don't have the id, and it's null
    const baseMessage = {
        from_id,
        _id: type + content,
        type, //Server can only set Info or approve decline for server message
    };
    const handleTransferMessageWithVariables = handleTransferMessage(baseMessage, db);
    switch (action) {
        case MessageType_1.ServerMessageAction.APPROVE:
        case MessageType_1.ServerMessageAction.DECLINE:
            return handleTransferMessageWithVariables(from_id, to_organizationId, content, action);
        case MessageType_1.ServerMessageAction.REQUEST:
            return handleTransferMessageRequest(baseMessage, from_id, to_organizationId, content, db);
        case MessageType_1.ServerMessageAction.DELETE:
            // const messageId = content;
            db.users.findOneAndUpdate({ _id: from_id }, //Delete all message from all organization
            { $pull: { "messages": { content: content } } });
            return "true";
    }
});
const handleRegisterMessageFromClient = (clientMessage, db) => __awaiter(void 0, void 0, void 0, function* () {
    const { type, action, from_id, to_id, to_organizationId, content } = clientMessage; //From front end, so don't have the id, and it's null
    //Id now is from_id because it's unique
    const baseMessage = {
        from_id,
        _id: from_id,
        type, //Server can only set Info or approve decline for server message
    };
    // let serverMessageContent = "";
    switch (action) {
        case MessageType_1.ServerMessageAction.REQUEST:
            //Update the registering user
            const registerUser = yield db.users.findOne({ _id: from_id });
            yield db.users.updateOne({ _id: from_id }, {
                $set: Object.assign(Object.assign({}, registerUser), { isAdmin: false, registering: true })
            });
            const serverMessage = Object.assign(Object.assign({}, baseMessage), { content, action: MessageType_1.ClientMessageAction.APPROVE_DECLINE, from_organizationId: "" });
            // Send a message to all admins
            yield db.users.updateMany({ isAdmin: true }, { $addToSet: { messages: serverMessage } });
            return "true";
        case MessageType_1.ServerMessageAction.APPROVE:
            //to_organizationId pass in should be ""
            const [operation, orgContent] = content.split("-");
            let newOrganizationId = "";
            if (operation === "create" && to_organizationId === "") {
                //Create new organization by extract the org name and generate id base on that 
                newOrganizationId = orgContent.replace(/\s+/g, '').trim(); //Generate new org Id
                yield db.organizations.insertOne({
                    _id: newOrganizationId,
                    name: orgContent
                });
            }
            else {
                newOrganizationId = orgContent;
            }
            //If not include "new", there should be to_organizationId provided
            const user = yield db.users.updateOne({ _id: to_id }, //May be I will pass the to_organization id to the from_id
            //@ts-expect-error : Only push more field into the user
            [
                { $addFields: { organization_id: newOrganizationId } },
                { $set: { registering: false } }
            ]);
            //Delete all message
            yield db.users.updateMany({ isAdmin: true }, { $pull: { "messages": { _id: to_id } } });
            if (!user || user.result.nModified == 0) {
                return "Cannot find user";
            }
            return "true";
        case MessageType_1.ServerMessageAction.DECLINE:
            //Delete the user
            yield db.users.findOneAndDelete({ _id: to_id } //Admin is from, user register is to
            );
            yield db.messages.findOneAndDelete({ _id: to_id });
            //Delete all messages
            yield db.users.updateMany({ isAdmin: true }, { $pull: { "messages": { _id: to_id } } });
            return "true";
        //Delete the server message to the admin
    }
    return "true";
});
exports.messagesResolver = {
    Mutation: {
        handleMessageFromClient: (_root, { input: clientMessage }, { db }) => __awaiter(void 0, void 0, void 0, function* () {
            switch (clientMessage.type) {
                case MessageType_1.MessageType.REGISTER:
                    return handleRegisterMessageFromClient(clientMessage, db);
                case MessageType_1.MessageType.TRANSFER:
                    return handleTransferMessageFromClient(clientMessage, db);
            }
        })
    },
    Query: {
        loadMessages: (_root, { viewerId, limit, page }, { db }) => __awaiter(void 0, void 0, void 0, function* () {
            //     try {
            const data = {
                total: 0,
                results: [],
                avatars: []
            };
            const res = yield db.users.find({ _id: viewerId }, 
            //@ts-expect-error this is correct with mongodb
            { messages: 1 }).next();
            const messages = res.messages;
            if (messages) {
                data.results = messages;
                data.total = messages.length;
                for (const message of messages) {
                    const user = yield db.users.findOne({ _id: message.from_id });
                    const avatar = user.avatar;
                    data.avatars.push(avatar);
                }
            }
            return data;
        }),
        getUserInfoFromMessage: (_root, { fromId, fromOrganizationId, content, type }, { db }) => __awaiter(void 0, void 0, void 0, function* () {
            const user = yield db.users.findOne({ _id: fromId });
            const userName = user.name;
            let organizationName = "";
            switch (type) {
                case MessageType_1.MessageType.TRANSFER:
                    const memberId = content;
                    const organization = yield db.organizations.findOne({ _id: fromOrganizationId });
                    const member = yield db.members.findOne({ _id: memberId });
                    organizationName = organization.name;
                    const memberName = `${member.lastName} ${member.firstName}`;
                    const user = yield db.users.findOne({ _id: fromId });
                    return { userName, organizationName, memberName, email: user.contact };
                case MessageType_1.MessageType.REGISTER:
                    // let serverMessageContent = "";
                    const registerUser = yield db.users.findOne({ _id: fromId });
                    const [operation, orgContent] = content.split("-");
                    //If exist, orgContent is the exist id
                    //If create, orgContent is the name
                    if (operation === "exist") {
                        const checkOrganization = yield db.organizations.findOne({ _id: orgContent });
                        if (checkOrganization) {
                            organizationName = checkOrganization.name;
                        }
                        else {
                            throw new Error("This organization does not exist");
                        }
                    }
                    else {
                        organizationName = orgContent;
                    }
                    return { userName, organizationName, memberName: "", email: registerUser.contact };
            }
        })
    },
};
