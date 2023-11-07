import Dexie from 'dexie';
import {array2tree} from '@/utils';
import Cookies from 'js-cookie';

/*
    TODO
    权限的 order 怎么处理？
*/

// 去除对象中值为空的字段
const format = (options={}) => {
    let result = {};
    for(let key in options) {
        if(options[key] || options[key] === 0) {
            result[key] = options[key];
        }
    }

    return result;
}

export class RTAdmin extends Dexie {
    constructor() {
        super('RT-Admin');

        this.version(1).stores({
            'user': "++id,username,name,avatar,email,status,roles,password,created_at,updated_at,deleted_at",
            'role': "++id,name,desc,users,modules,created_at,updated_at,deleted_at",
            'module': "++id,pid,order,code,name,desc,type,created_at,updated_at,deleted_at",
            'role-user': "++id,userId,roleId",
            'role-module': "++id,roleId,moduleId",
        });
    }

    // 登录
    async login(options={}) {
        return new Promise((resolve, reject) => {
            this.user.where({username: options.username, password: options.password}).toArray().then(r => {
                if(r.length) {
                    resolve({code: 0, data: r[0].id, message: '成功'});
                }else{
                    reject({code: -1, data: null, message: `账号、密码错误`});
                }
            }).catch(e => {
                reject({code: -1, data: null, message: `账号、密码错误`});
            })
        });
    }

    // 添加用户
    async addUser(options) {
        let {roles=[], ...rest} = options,
            now = +new Date();

        return new Promise((resolve, reject) => {
            this.transaction('rw', 'user', 'role-user', async () => {
                let exist = await this.user.where({username: rest.username}).toArray();

                if(exist.length) {
                    return reject({code: -1, data: null, message: `用户名已存在`});
                }

                let userId = await this.user.add({...rest, password: '123456', created_at: now, updated_at: now});

                let rolesData = (roles || []).map(i => ({roleId: i, userId}));
                if(rolesData.length) {
                    await this['role-user'].bulkAdd(rolesData);
                }

                return userId;
            }).then((record) => {
                resolve({code: 0, data: record, message: '成功'});
            }).catch(e => {
                reject({code: -1, data: null, message: e.message || '失败'});
            });
        });
    }
    getUserInfo() {
        let id = Cookies.get('rt-admin');
        return new Promise(async (resolve, reject) => {
            if(!id) return reject({code: -1, data: null, message: `登录过期`});

            id = parseInt(id);
            this.transaction('rw', 'user', 'role-user', 'role-module', async () => {
                let userInfo = await this.user.get(id),
                    roleIds = await this['role-user'].where({userId: userInfo.id}).toArray().map(i => i.roleId),
                    moduleIds = await this['role-module'].where(roleIds.map(i => ({roleId: i}))).toArray().map(i => i.moduleId);

                // 获取角色详情
                let roleInfos = await this.role.where(roleIds).toArray(),
                    moduleInfos = await this.module.where(moduleIds).toArray();

                userInfo['roles'] = roleInfos;
                userInfo['modules'] = moduleInfos;
                userInfo['moduleTree'] = array2tree(moduleInfos);;

                delete userInfo['password'];

                return userInfo;
            }).then((record) => {
                resolve({code: 0, data: record, message: '成功'});
            }).catch(e => {
                reject({code: -1, data: null, message: e.message || '失败'});
            });

        });
    }
    getUserList(options={}) {
        options = format(options);
        let {username, name, email, status} = options || {},
            obj = format({username, name, email, status}),
            isAll = Object.keys(obj).length === 0;

        return new Promise((resolve, reject) => {
            this.transaction('rw', 'user', 'role-user', async () => {
                let record = await ( isAll ? this.user : this.user.where(obj)).toArray((users) => {

                    const promiseItems = users.map(i => {
                        return new Promise(async (resolve, reject) => {
                            let rs = await this['role-user'].where({userId: i.id}).toArray();

                            i.roles = rs.map(m => m.roleId);
                            delete i['password'];

                            resolve(i);
                        })
                    });

                    return Promise.all(promiseItems)
                });


                return record;
            }).then((record) => {
                resolve({code: 0, data: record, message: '成功'});
            }).catch(e => {
                reject({code: -1, data: null, message: e.message || '失败'});
            });
        });
    }
    deleteUser(id) {
        // 需要删除 关联的角色
        return new Promise((resolve, reject) => {
            this.transaction('rw', 'user', 'role-user', async () => {
                let users = await this['role-user'].where({userId: id}).toArray(),
                    usersData = users.map(i => i.id);

                await this.user.delete(id);
                await this['role-user'].bulkDelete(usersData);

                return id;
            }).then((id) => {
                resolve({code: 0, data: id, message: '成功'});
            }).catch(e => {
                reject({code: -1, data: null, message: e.message || '失败'});
            });
        });
    }

    // 角色
    async addRole(options) {
        let {modules, users, ...rest} = options,
            now = +new Date();

        return new Promise((resolve, reject) => {
            this.transaction('rw', 'role', 'role-user', 'role-module', async () => {
                let roleId = await this.role.add({...rest, created_at: now, updated_at: now});

                let modulesData = (modules || []).map(i => ({moduleId: i, roleId})),
                    usersData = (users || []).map(i => ({userId: i, roleId}));

                await this['role-module'].bulkAdd(modulesData);
                await this['role-user'].bulkAdd(usersData);

                let record = await this.role.get(roleId);

                return record;
            }).then((record) => {
                resolve({code: 0, data: record, message: '成功'});
            }).catch(e => {
                reject({code: -1, data: null, message: e.message || '失败'});
            });
        });
    }
    deleteRole(id) {
        // 需要删除 关联的用户和 关联的角色
        return new Promise((resolve, reject) => {
            this.transaction('rw', 'role', 'role-user', 'role-module', async () => {
                let users = await this['role-user'].where({roleId: id}).toArray(),
                    modules = await this['role-module'].where({roleId: id}).toArray(),
                    usersData = users.map(i => i.id),
                    modulesData = modules.map(i => i.id);

                await this.role.delete(id);
                await this['role-user'].bulkDelete(usersData);
                await this['role-module'].bulkDelete(modulesData);

                return id;
            }).then((id) => {
                resolve({code: 0, data: null, message: '成功'});
            }).catch(e => {
                reject({code: -1, data: null, message: e.message || '失败'});
            });
        });
    }
    getRoleInfo(id='') {
        return this.role.get(id);
    }
    getRoleList(options={}) {
        options = format(options);
        let {name, desc} = options || {},
            obj = format({name, desc}),
            isAll = Object.keys(obj).length === 0;

        return new Promise((resolve, reject) => {
            this.transaction('rw', 'role', 'role-user', 'role-module', async () => {
                let record = await ( isAll ? this.role : this.role.where(format({name, desc}))).toArray((roles) => {

                    const promiseItems = roles.map(i => {
                        return new Promise(async (resolve, reject) => {
                            let us = await this['role-user'].where({roleId: i.id}).toArray(),
                                ms = await this['role-module'].where({roleId: i.id}).toArray();

                            i.users = us.map(m => m.userId);
                            i.modules = ms.map(m => m.moduleId);

                            resolve(i);
                        })
                    });

                    return Promise.all(promiseItems)
                });


                return record;
            }).then((record) => {
                resolve({code: 0, data: record, message: '成功'});
            }).catch(e => {
                reject({code: -1, data: null, message: e.message || '失败'});
            });
        });
    }

    // 权限
    async addModule(options) {
        let {roles=[], ...rest} = options,
            pid = options.pid,
            order = await this.module.where({pid}).count(),
            now = +new Date();

        return new Promise((resolve, reject) => {
            this.transaction('rw', 'module', 'role-module', async () => {
                let moduleId = await this.module.add({...rest, order, created_at: now, updated_at: now});

                let modulesData = (roles || []).map(i => ({moduleId, roleId: i}));
                if(modulesData.length) {
                    await this['role-module'].bulkAdd(modulesData);
                }

                return moduleId;
            }).then((record) => {
                resolve({code: 0, data: record, message: '成功'});
            }).catch(e => {
                reject({code: -1, data: null, message: e.message || '失败'});
            });
        });
    }
    async updateModule(options, id) {
        let {roles=[], ...rest} = options,
            now = +new Date();

        return new Promise((resolve, reject) => {
            this.transaction('rw', 'module', 'role-module', async () => {
                await this.role.update(id, {...rest, updated_at: now});

                let allIds = await this['role-module'].get(id).toArray(),
                    needDeleteIds = allIds.filter(i => !roles.includes(i)),
                    needAddIds = roles.filter(i => !allIds.includes(i));

                if(needDeleteIds.length) {
                    let rmIds = await this['role-module'].where(needDeleteIds.map(i => ({roleId: i}))).toArray()
                    await this['role-module'].bulkDelete(rmIds.map(i => i.id));
                }
                if(needAddIds) {
                    await this['role-module'].bulkAdd(needAddIds.map(i => ({moduleId: id, roleId: i})));
                }

                let record = await this.role.get(id);

                return record;
            }).then((record) => {
                resolve({code: 0, data: record, message: '成功'});
            }).catch(e => {
                reject({code: -1, data: null, message: e.message || '失败'});
            });
        });
    }
    deleteModule(id) {
        // 需要删除 关联的角色
        return new Promise((resolve, reject) => {
            this.transaction('rw', 'module', 'role-module', async () => {
                let roles = await this['role-module'].where({moduleId: id}).toArray(),
                    rolesData = roles.map(i => i.id);

                await this.module.delete(id);
                await this['role-module'].bulkDelete(rolesData);

                return id;
            }).then((id) => {
                resolve({code: 0, data: null, message: '成功'});
            }).catch(e => {
                reject({code: -1, data: null, message: e.message || '失败'});
            });
        });
    }
    getModuleInfo(id='') {
        return this.module.get(id);
    }
    async getModuleList() {
        return new Promise((resolve, reject) => {
            this.transaction('rw', 'module', 'role-module', async () => {
                return await this.module.toArray(async modules => {
                    const promiseItems = modules.map(i => {
                        return new Promise(async (resolve, reject) => {
                            let rs = await this['role-module'].where({moduleId: i.id}).toArray();

                            i.roles = rs.map(m => m.roleId);

                            resolve(i);
                        })
                    });

                    return Promise.all(promiseItems);
                });
            }).then((modules) => {
                let tree = array2tree(modules);
                resolve({code: 0, data: tree, message: '成功'});
            }).catch(e => {
                reject({code: -1, data: null, message: e.message || '失败'});
            });
        });
    }
}

const rtDb = new RTAdmin();
export default rtDb;