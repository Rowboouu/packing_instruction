// import { HttpModule, HttpService } from '@nestjs/axios';
// import { Module, OnModuleInit } from '@nestjs/common';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { TerminusModule } from '@nestjs/terminus';
// import { ZuluApiHealthIndicator } from './zulu-api.health';
// import { ZuluApiService } from './zulu-api.service';

// @Module({
//   imports: [
//     HttpModule.registerAsync({
//       imports: [ConfigModule],
//       useFactory: async (configService: ConfigService) => ({
//         baseURL: configService.get('ZULU_URL'),
//         withCredentials: true,
//       }),
//       inject: [ConfigService],
//     }),
//     TerminusModule,
//   ],
//   providers: [ZuluApiService, ZuluApiHealthIndicator],
//   exports: [ZuluApiService, ZuluApiHealthIndicator],
// })
// export class ZuluApiModule extends HttpModule implements OnModuleInit {
//   constructor(
//     private readonly httpService: HttpService,
//     private readonly zuluApiService: ZuluApiService,
//   ) {
//     super();
//   }

//   //Start zulu api authentication
//   async onModuleInit() {
//     const axios = this.httpService.axiosRef;

//     let authData = await this.zuluApiService.authenticate();

//     axios.interceptors.request.use((config) => {
//       config.headers.Cookie = `session_id=${authData.result.session_id}`;
//       return config;
//     });

//     axios.interceptors.response.use(undefined, async (error) => {
//       if (
//         error.response &&
//         error.response.status >= 404 &&
//         error.response.status < 500
//       ) {
//         // If the error is a client error (4xx) or a server error (5xx) except 404
//         authData = await this.zuluApiService.authenticate(); // Re-authenticate and log
//         error.config.headers.Cookie = `session_id=${authData.result.session_id}`; // Update the session_id
//         return axios.request(error.config); // Retry the request
//       }
//       return Promise.reject(error);
//     });
//   }
// }
import { HttpModule, HttpService } from '@nestjs/axios';
import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { ZuluApiHealthIndicator } from './zulu-api.health';
import { ZuluApiService } from './zulu-api.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        baseURL: configService.get('ZULU_URL'),
        withCredentials: true,
      }),
      inject: [ConfigService],
    }),
    TerminusModule,
  ],
  providers: [ZuluApiService, ZuluApiHealthIndicator],
  exports: [ZuluApiService, ZuluApiHealthIndicator],
})
export class ZuluApiModule extends HttpModule implements OnModuleInit {
  private readonly logger = new Logger(ZuluApiModule.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly zuluApiService: ZuluApiService,
  ) {
    super();
  }

  //Start zulu api authentication
  async onModuleInit() {
    try {
      const axios = this.httpService.axiosRef;

      // Try to authenticate, but handle failures gracefully
      let authData = await this.zuluApiService.authenticate();

      // Check if authentication was successful
      if (authData?.result?.session_id) {
        this.logger.log('Zulu API authentication successful, setting up interceptors');

        axios.interceptors.request.use((config) => {
          config.headers.Cookie = `session_id=${authData.result.session_id}`;
          return config;
        });

        axios.interceptors.response.use(undefined, async (error) => {
          if (
            error.response &&
            error.response.status >= 404 &&
            error.response.status < 500
          ) {
            try {
              // If the error is a client error (4xx) or a server error (5xx) except 404
              authData = await this.zuluApiService.authenticate(); // Re-authenticate and log
              
              if (authData?.result?.session_id) {
                error.config.headers.Cookie = `session_id=${authData.result.session_id}`; // Update the session_id
                return axios.request(error.config); // Retry the request
              }
            } catch (reAuthError) {
              this.logger.warn('Re-authentication failed:', reAuthError.message);
            }
          }
          return Promise.reject(error);
        });
      } else {
        this.logger.warn('Zulu API authentication failed or returned invalid data. Module will continue without authentication.');
        this.logger.warn('Zulu API features may not work properly until the service is available.');
      }
    } catch (error) {
      this.logger.error('Failed to initialize Zulu API module:', error.message);
      this.logger.warn('Zulu API module will continue without authentication. Features may be limited.');
      // Don't throw the error - let the module continue to load
    }
  }
}