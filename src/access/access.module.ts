// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { PassportModule } from '@nestjs/passport';
// import { JwtModule } from '@nestjs/jwt';

// import { JwtStrategy } from './strategies/jwt.strategy';

// @Module({
//   controllers: [AccessController],
//   providers: [AccessService, JwtStrategy],
//   imports: [
//     TypeOrmModule.forFeature([Access]),
//     PassportModule.register({ defaultStrategy: 'jwt' }),
//     JwtModule.registerAsync({
//       imports: [],
//       inject: [],
//       useFactory: () => {
//         return {
//           secret: process.env.JWT_SECRET,
//           signOptions: {
//             expiresIn: '2h'
//           }
//         }
//       }
//     })
//     // JwtModule.register({
//     //   secret: process.env.JWT_SECRET,
//     //   signOptions: {
//     //     expiresIn: '2h'
//     //   }
//     // })
//   ],
//   exports: [TypeOrmModule, JwtStrategy, PassportModule, JwtModule]
// })
// export class AccessModule { }
