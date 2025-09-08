# Learning Building Web App
This is a repository for the .Net9.0, Angular 20 and Tailwind/DaisyUI version of web page.<br/>
And using Azure to publish.<br/>
View a demo of this app [here](http://da-strollist-2025.azurewebsites.net/). You just need to register a user and sign in to see it in action.<br/>
Note: This is using the free version of Azure Sql DB, which would auto-pause ehn not in use. So the first request may take some time.

# Setting
Need to apply an account from Cloudinary [here](https://cloudinary.com) <br/>
To get the following information, which in {} you need to replace to your version, and save it as appsettings.json below API folder<br/>
```
  "CloudinarySettings": {
    "CloudName": "{CloudName}",
    "ApiKey": "{APIKey}",
    "ApiSecret":"{APISECRET}"
  },
```
<br/>
To local develop, add a file appsettings.Development.json. To add your local connection.
```
{
    "Logging": {
        "LogLevel": {
            "Default": "Information",
            "Microsoft.AspNetCore": "Warning"
        }
    },
    "ConnectionStrings": {
        "DefaultConnection": "Server=localhost,1433;Database=datingdb;User Id=SA;Password=Password@1;TrustServerCertificate=true;"
    },
    "TokenKey":"super secret key super secret key super secret key super secret key "
}
```
you will need to install Cert with [mkcert](https://github.com/FiloSottile/mkcert)<br/>
# Problem
I have encounter net::ERR_CERT_AUTHORITY_INVALID in ASP.NET Core with my windows machine.<br/>
I find a Solution [here](https://stackoverflow.com/questions/63796566/neterr-cert-authority-invalid-in-asp-net-core).<br/>

```
dotnet dev-certs https --clean
dotnet dev-certs https --trust
```
Hope this can help you.
