drop database if exists RWA;
create database RWA;
use RWA;

--

drop table if exists usuario;
create table users (
    id int primary key auto_increment,
    username varchar(25),
    password varchar(255),
    fullname varchar(120) -- encriptada
    -- usuarioestatus tinyint(1) constraint check (usuarioestatus = 1 or usuarioestatus = 2) default 1,
    -- usuariocambiapass tinyint(1) constraint check (usuariocambiapass = 0 or usuariocambiapass = 1) default 0,
    -- usuariocorreo varchar(120)
);

drop table if exists rol;
create table rol (
    rolid int(10) primary key auto_increment,
    roldescripcion varchar(120)
);

drop table if exists funcion;
create table funcion (
    funcionid int primary key auto_increment,
    funciondescripcion varchar(120)
);

drop table if exists rolfuncion;
create table rolfuncion (
    rolid int,
    functionid int
);

drop table if exists parametro;
create table parametro (
    parcodigo char(50) primary key,
    pardescripcion varchar(120),
    parexplicacion text,
    partipo tinyint(1) constraint check (partipo = 1 or partipo = 2 or partipo = 3 or partipo = 4),
    parvalor varchar(250)
);

drop table if exists tipoparametro;
create table tipoparametro (
    tipoparid int primary key auto_increment,
    tipoparcodigo varchar(10) null, 
    tipodescripcion varchar(120) null
    -- tipoparfechacrea datetime null,
    -- tipoparfechamod datetime null
);

drop table if exists rol;
create table rol (
    rolid int primary key auto_increment,
    roldescripcion varchar(10),
    rolusrcreaid foreign key references users(id),
    rolfechacrea datetime null,
    rolusrmodid foreign key references users(id),
    rolfechamod datetime null default null
);

select * from usuario;