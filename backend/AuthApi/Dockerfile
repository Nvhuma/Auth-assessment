# backend/AuthApi/Dockerfile

# ── Stage 1: BUILD ───
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

# Set the working directory inside the container
WORKDIR /src


# Copy only the project files first (for better caching)
COPY ["AuthApi/AuthApi.csproj", "AuthApi/"]
COPY ["AuthApi.Tests/AuthApi.Tests.csproj", "AuthApi.Tests/"]
COPY ["AuthAssessment.sln", "."]

# Restore NuGet packages (downloads from NuGet.org)
RUN dotnet restore

# NOW copy all the source code
COPY . .

# Build in Release mode — optimized, no debug symbols
RUN dotnet build -c Release --no-restore

# Run the tests during the Docker build
# If tests fail, the Docker build fails — great safety net
RUN dotnet test AuthApi.Tests/AuthApi.Tests.csproj --no-build -c Release

# Publish = compile + bundle all files needed to run the app
# Output goes to /app/publish
RUN dotnet publish "AuthApi/AuthApi.csproj" -c Release -o /app/publish --no-build

# ── Stage 2: RUNTIME ────────────────────────────────────────────────────────
# Switch to the ASP.NET runtime image — much smaller (~200MB)
# This is the image that actually runs in production
# It does NOT have the SDK — you can't build code in it, only run it
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime

WORKDIR /app

# Copy only the published output from the build stage
# This is the "multi-stage build" pattern — keeps the final image lean
COPY --from=build /app/publish .

# The port our API listens on inside the container
# Docker uses this as documentation — it doesn't actually open the port
# (docker-compose.yml does that with "ports:")
EXPOSE 5000

# Tell ASP.NET Core to listen on port 5000 (not the default 8080)
ENV ASPNETCORE_URLS=http://+:5000

# The command to run when the container starts
ENTRYPOINT ["dotnet", "AuthApi.dll"]