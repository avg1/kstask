using Kaspersky.BookEditor.Services;

namespace Kaspersky.BookEditor.Cache
{
    public abstract class CacheDecoratorBase
    {
        protected ICacheService CacheService { get; }
        protected virtual string CacheKey { get; }

        protected CacheDecoratorBase(ICacheService cacheService)
        {
            CacheService = cacheService;
            CacheKey = $"{GetType().FullName}:Cache";
        }
    }
}
