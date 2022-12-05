# DispathcerServlet Spring Web 简易框架

# DispathcerServlet Spring Web 简易框架

1. 准备 applicationContext.xml 对应 bean
    
    ```xml
    <?xml version="1.0" encoding="UTF-8"?>
    <beans>
        <bean id="fruitDao" class="com.test.dao.FruitDao"/>
    
        <bean id="fruitService" class="com.test.service.impl.FruitServiceImpl">
            <property name="fruitDao" ref="fruitDao"/>
        </bean>
    
        <bean id="fruit" class="com.test.controller.FruitController">
            <property name="fruitService" ref="fruitService"/>
        </bean>
    </beans>
    ```
    
2. 通过实现 ServletContextListener 监听器接口，并重写 contextInitialized 方法获取 BeanFactory 对象放入 ServletContext 域中
    
    ```java
    // 创建 BeanFactory 对象
    BeanFactory beanFactory = new ClassPathXmlApplicationContext();
    ServletContext application = ServletContextEvent.getServletContext();
    // 放入应用域总中
    application.setAttribute("beanFactory", beanFactory);
    ```
    
3.  新建 BeanFactory 接口，并创建 ClassPathXmlApplicationContext 实现类通过 applicationContext.xml 文件获取相对应的 bean 
    
    ```java
    // 转化 path 为流
    InputStream is = this.getClass().getClassLoader().getResourceAsStream(path);
    // 获取 document 对象
    DocumentBuildFactory dbf = DocumentBuildFactory.newInstance();
    DocumentBuild db = dbf.newDocumentBuild();
    Document doc = db.parse(is);
    ```
    
4. 遍历节点找到元素节点加入到 beanMap 中
    
    ```java
    // 获取 nodeList
    NodeList nodeList = doc.getDocumentElement();
    // 将 bean 节点放入 beanMap
    for (int i = 0; i < nodeList.getLength(); i++) {
    	Node node = NodeList.item(i);
    		if (node.getNodeType() == Node.ELEMENT_NODE) {
    			Element element = (Element) node;
    			String id = element.getAttribute("id");
    			String clazz = element.getAttribute("class");
    			// 反射获取 class
    			Object beanObj = Class.forName(clazz).newInstance();
    			beanMap.put(id, beanObj);
    	}
    }
    ```
    
5. 再次循环进行依赖注入
    
    ```java
    for (int i = 0; i < nodeList.getLength(); i++) {
    	Node node = nodeList.item(i);
    	if (node.getNodeType() == Node.ELEMENT_NODE) {
    		// 获取子节点 property
    		Element baseBean = (Element) node;
    		String baseId = baseBean.getAttribute("id");
    		NodeList childNodes = node.getChildNodes();
    		for (int j = 0; j < childNodes.getLength(); j++) {
    			Node property = childNodes.item(j);
    			if (property.getNodeType() == Node.ELEMENT_NODE) {
    				Element propertyEle = (Element) property;
    				String name = propertyEle.getAttribute("name");
    				String ref = propertyEle.getAttribute("ref");
    				Object baseObj = beanMap.get(baseId);
    				Object refObj = beanMap.get(ref);
    				// 反射获取成员变量
    				Field dependency = baseObj.getClass().getDeclaredField(name);
    				dependency.setAccessible(true);
    				// 设置依赖
    				dependency.set(baseObj, refObj);
    			}
    		}
    	}	
    }
    ```
    
6. 在 DispatcherServlet 类中继承 HttpServlet 并在 init() 方法中从 ServletContext 获取 beanFactory
    
    ```java
    public class DispatcherServlet implements HttpServlet {
    	
    	public BeanFactory beanFactory;
    
    	@Override
    	public void init () throw ServletException {
    		ServletContext application = this.getServletContext();
    		Object beanFactoryObj = application.getAttribute("beanFactory");
    		if (beanFactoryObj != null) {
    			beanFactory = (BeanFactory) beanFactory;	
    		}else {
    			throw new RuntimeException("Ioc 容器获取失败！");
    		}
    	}
    }
    ```
    
7. 在 DispatcherServlet service 方法中利用请求中的 operate 反射获取调用方法，并通过 url 地址从 beanFactory 获取操作的 Controller
    
    ```java
    public void service (HttpServletRequest request, HttpServletResponse response) throw ServletException, IOException, IllegalAccessException, InvocationTargetException {
    	request.setCharacterEncoding("UTF-8");
    
    	// 获取路径并分割
    	String uri = request.getServletPath().substring(1); // /fruit?operate=add -> fruit?..
    	String beanName = uri.contains("?") ? uri.substring(0, uri.indexOf("?") : uri);
    	String operate = request.getParameter("operate");
    	if (operate == null || "".equals(operate)) {
    		operate = "index";
    	}
    	
    	// 通过 beanName 获取对应实体类
    	Object beanObj = Class.forName(beanName).newInstance();
    	// 获取对应 operate
    	Method[] methods = beanObj.getClass().getDeclaredMethods();
    	for (Method method : methods) {
    		String methodName = method.getName();
    		if (operate.equals(methodName)) {
    			// 获取参数
    			Parameter[] parameter = method.getParameters();
    			Object[] paramVal = new Object[parameter.length];
    			for (int i = 0; i < parameters.length; i++) {
    	      if (parameters[i].getType().getName().contains("request")) {
    		      paramVal[i] = request;
    	      } else if (parameters[i].getType().getName().contains("response")) {
    		      paramVal[i] = response;
    	      }
          }
    			method.setAccessible(true);
    			method.invoke(beanObj, paramVal);
    		}
    	}
    }
    ```
    
8. 完整代码
    - Listener
        
        ```java
        public class MyServletContextListener implements ServletContextListener () {
        	
        	@Override
        	public void contextInitialized (ServletContextEvent servletContextEvent) {
        		// 创建 BeanFactory 对象
        		BeanFactory beanFactory = new ClassPathXmlApplicationContext();
        		ServletContext application = ServletContextEvent.getServletContext();
        		// 放入应用域总中
        		application.setAttribute("beanFactory", beanFactory);
        	}
        
        	@Override
        	public void contextDestroyed (ServletContextEvent servletContextEvent) {
        
        	}
        }
        ```
        
    - ClassPathXmlApplicationContext 实现
        
        ```java
        public interface BeanFactory {
        	Object getBean(String id);
        }
        
        public class ClassPathXmlApplicationContext implements BeanFactory {
        
        	public Map<String, Object> beanMap = new HashMap<>();
        
        	public ClassPathXmlApplicationContext () {
        		ClassPathXmlApplicationContext("applicationContext.xml");
        	}
        	// 初始化获取 beanMap
        	public ClassPathXmlApplicationContext (String path) throw Exception {
        		// 转化 path 为流
        		InputStream is = this.getClass().getClassLoader().getResourceAsStream(path);
        		// 获取 document 对象
        		DocumentBuildFactory dbf = DocumentBuildFactory.newInstance();
        		DocumentBuild db = dbf.newDocumentBuild();
        		Document doc = db.parse(is);
        
        		// 获取 nodeList
        		NodeList nodeList = doc.getDocumentElement();
        		// 将 bean 节点放入 beanMap
        		for (int i = 0; i < nodeList.getLength(); i++) {
        			Node node = NodeList.item(i);
        			if (node.getNodeType() == Node.ELEMENT_NODE) {
        				Element element = (Element) node;
        				String id = element.getAttribute("id");
        				String clazz = element.getAttribute("class");
        
        				// 反射获取 class
        				Object beanObj = Class.forName(clazz).newInstance();
        				beanMap.put(id, beanObj);
        			}
        		}
        
        		for (int i = 0; i < nodeList.getLength(); i++) {
        			Node node = nodeList.item(i);
        			if (node.getNodeType() == Node.ELEMENT_NODE) {
        				// 获取子节点 property
        				Element baseBean = (Element) node;
        				String baseId = baseBean.getAttribute("id");
        				NodeList childNodes = node.getChildNodes();
        				for (int j = 0; j < childNodes.getLength(); j++) {
        					Node property = childNodes.item(j);
        					if (property.getNodeType() == Node.ELEMENT_NODE) {
        						Element propertyEle = (Element) property;
        						String name = propertyEle.getAttribute("name");
        						String ref = propertyEle.getAttribute("ref");
        						Object baseObj = beanMap.get(baseId);
        						Object refObj = beanMap.get(ref);
        						// 反射获取成员变量
        						Field dependency = baseObj.getClass().getDeclaredField(name);
        						dependency.setAccessible(true);
        
        						// 设置依赖
        						dependency.set(baseObj, refObj);
        					}
        				}
        			}
        		}
        
        	}
        
        	@Override
        	public Object getBean (String id) {
        		return beanMap.get(id);
        	}
        }
        ```
        
    - DispatcherServlet 中央控制器
        
        ```java
        public class DispatcherServlet implements HttpServlet {
        	
        	public BeanFactory beanFactory;
        
        	@Override
        	public void init () throw ServletException {
        		ServletContext application = this.getServletContext();
        		Object beanFactoryObj = application.getAttribute("beanFactory");
        		if (beanFactoryObj != null) {
        			beanFactory = (BeanFactory) beanFactory;	
        		}else {
        			throw new RuntimeException("Ioc 容器获取失败！");
        		}
        	}
        
        	@Override
        	public void service (HttpServletRequest request, HttpServletResponse response) throw ServletException, IOException, IllegalAccessException, InvocationTargetException {
        		request.setCharacterEncoding("UTF-8");
        
        		// 获取路径并分割
        		String uri = request.getServletPath().substring(1); // /fruit?operate=add -> fruit?..
        		String beanName = uri.contains("?") ? uri.substring(0, uri.indexOf("?") : uri);
        		String operate = request.getParameter("operate");
        		if (operate == null || "".equals(operate)) {
        			operate = "index";
        		}
        	
        		// 通过 beanName 获取对应实体类
        		Object beanObj = Class.forName(beanName).newInstance();
        		// 获取对应 operate
        		Method[] methods = beanObj.getClass().getDeclaredMethods();
        		for (Method method : methods) {
        			String methodName = method.getName();
        			if (operate.equals(methodName)) {
        				// 获取参数
        				Parameter[] parameter = method.getParameters();
        				Object[] paramVal = new Object[parameter.length];
        				for (int i = 0; i < parameters.length; i++) {
        		      if (parameters[i].getType().getName().contains("request")) {
        			      paramVal[i] = request;
        		      } else if (parameters[i].getType().getName().contains("response")) {
        			      paramVal[i] = response;
        		      }
        	      }
        				method.setAccessible(true);
        				method.invoke(beanObj, paramVal);
        			}
        		}
        	}
        }
        ```

