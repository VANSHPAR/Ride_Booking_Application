package com.example.uberbookingservice.controllers;

import com.example.uberbookingservice.apis.LocationServiceApi;
import com.example.uberbookingservice.apis.UberSocketApi;
import com.netflix.discovery.EurekaClient;
import okhttp3.OkHttpClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

@Configuration
public class RetroConfig {
    @Autowired
    private EurekaClient eurekaClient;

    private String getServiceUrl(String serviceName) {
        return eurekaClient.getNextServerFromEureka(serviceName,false).getHomePageUrl();
    }

    @Bean
    public LocationServiceApi locationServiceApi() {
        System.out.println(getServiceUrl("UBERPROJECT-LOCATIONSERVICE"));
        OkHttpClient client = new OkHttpClient.Builder()
                .addInterceptor(chain -> {
                    String authHeader = null;
                    ServletRequestAttributes attrs =
                            (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
                    if (attrs != null) {
                        authHeader = attrs.getRequest().getHeader("Authorization");
                    }
                    okhttp3.Request.Builder builder = chain.request().newBuilder();
                    if (authHeader != null) {
                        builder.header("Authorization", authHeader);
                    }
                    return chain.proceed(builder.build());
                })
                .build();
        return new Retrofit.Builder()
                .baseUrl(getServiceUrl("UBERPROJECT-LOCATIONSERVICE"))
                .addConverterFactory(GsonConverterFactory.create())
                .client(new OkHttpClient.Builder().build())
                .build().create(LocationServiceApi.class);
    }

    @Bean
    public UberSocketApi uberSocketapi() {
       String serviceUrl=getServiceUrl("CLIENTSOCKETSERVICE");
        System.out.println("Service URL for socket : "+serviceUrl);

        OkHttpClient client = new OkHttpClient.Builder()
                .addInterceptor(chain -> {
                    String authHeader = null;
                    ServletRequestAttributes attrs =
                            (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
                    if (attrs != null) {
                        authHeader = attrs.getRequest().getHeader("Authorization");
                    }
                    okhttp3.Request.Builder builder = chain.request().newBuilder();
                    if (authHeader != null) {
                        builder.header("Authorization", authHeader);
                    }
                    return chain.proceed(builder.build());
                })
                .build();

        return new Retrofit.Builder()
                .baseUrl(serviceUrl)
                .addConverterFactory(GsonConverterFactory.create())
                .client(new OkHttpClient.Builder().build())
                .build().create(UberSocketApi.class);

    }

}
