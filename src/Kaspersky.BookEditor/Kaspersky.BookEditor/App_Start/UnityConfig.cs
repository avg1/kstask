using System.Web.Mvc;
using Microsoft.Practices.Unity;
using Unity.Mvc5;
using System;
using Kaspersky.BookEditor.DAL.Repositories;
using Kaspersky.BookEditor.Cache.Decorators;
using Kaspersky.BookEditor.Services;
using System.Web.Http;

namespace Kaspersky.BookEditor
{
    public static class UnityConfig
    {
        public static void RegisterComponents()
        {
            var container = new UnityContainer();

            var id = Guid.NewGuid().ToString();

            container.RegisterType<ICacheService, CacheService>(id, new InjectionConstructor());
            container.RegisterType<IBooksRepository, BooksRepository>(id);

            container.RegisterType<IBooksRepository, BooksCacheDecorator>(
                new InjectionConstructor(
                    new ResolvedParameter<ICacheService>(id), new ResolvedParameter<IBooksRepository>(id)));

            DependencyResolver.SetResolver(new UnityDependencyResolver(container));

            GlobalConfiguration.Configuration.DependencyResolver = new Unity.WebApi.UnityDependencyResolver(container);
        }
    }
}
